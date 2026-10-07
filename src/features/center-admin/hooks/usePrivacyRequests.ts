import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getPrivacyListRequestsQueryKey,
  getPrivacyListRequestsQueryOptions,
  privacyResolveRequest,
} from '@/shared/api/generated/endpoints/privacy/privacy';
import type { PrivacyRequestListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Las solicitudes de derechos de la clientela: las abiertas primero, la que vence antes arriba. */
export function usePrivacyRequestList(): UseQueryResult<PrivacyRequestListResponseDto, ErrorType> {
  return useQuery(getPrivacyListRequestsQueryOptions(useActiveCenterId()));
}

export interface PrivacyRequestAnswer {
  requestId: string;
  outcome: 'completed' | 'rejected';
  note?: string;
}

interface ResolvePrivacyRequest {
  run: (answer: PrivacyRequestAnswer) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

/** Responder una solicitud: la persona lo sabe por un aviso push. */
export function useResolvePrivacyRequest(): ResolvePrivacyRequest {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ requestId, outcome, note }: PrivacyRequestAnswer) =>
      privacyResolveRequest(centerId, requestId, { outcome, ...(note !== undefined && { note }) }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getPrivacyListRequestsQueryKey(centerId) }),
  });

  return {
    run: (answer) => {
      mutation.mutate(answer);
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
