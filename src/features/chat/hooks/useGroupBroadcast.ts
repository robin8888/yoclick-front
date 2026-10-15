import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  chatBroadcastToGroup,
  getChatListConversationsQueryKey,
} from '@/shared/api/generated/endpoints/chat/chat';
import { getGroupsListQueryOptions } from '@/shared/api/generated/endpoints/clients/clients';
import type { GroupListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los grupos del centro, para elegir a quién se escribe. */
export function useBroadcastGroups(): UseQueryResult<GroupListResponseDto, ErrorType> {
  return useQuery(getGroupsListQueryOptions(useActiveCenterId()));
}

export interface BroadcastResult {
  sentCount: number;
  skippedMinorCount: number;
}

interface GroupBroadcast {
  send: (request: { groupId: string; body: string }) => void;
  isSending: boolean;
  result: BroadcastResult | null;
  errorMessage: string | null;
}

/** Escribe a todas las personas de un grupo; no es optimista: espera al servidor. */
export function useGroupBroadcast(): GroupBroadcast {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: { groupId: string; body: string }) =>
      chatBroadcastToGroup(centerId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
    },
  });

  return {
    send: (request) => {
      mutation.mutate(request);
    },
    isSending: mutation.isPending,
    result: mutation.data ?? null,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
