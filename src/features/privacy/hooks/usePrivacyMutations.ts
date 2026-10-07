import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getMeGetConsentsQueryKey, meSetConsent } from '@/shared/api/generated/endpoints/me/me';
import {
  getPrivacyListMyRequestsQueryKey,
  privacyCreateRequest,
} from '@/shared/api/generated/endpoints/privacy/privacy';
import type { CreatePrivacyRequestDto, SetConsentRequestDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface PrivacyMutation<TInput> {
  run: (input: TInput, onDone?: () => void) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

function successOptions(onDone: (() => void) | undefined): { onSuccess?: () => void } {
  return onDone ? { onSuccess: onDone } : {};
}

/** Conceder o retirar un consentimiento opcional; el servidor guarda cada cambio. */
export function useSetConsent(): PrivacyMutation<SetConsentRequestDto> {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: SetConsentRequestDto) => meSetConsent(request),
    onSuccess: (consents) => {
      queryClient.setQueryData(getMeGetConsentsQueryKey(), consents);
    },
  });

  return {
    run: (request, onDone) => {
      mutation.mutate(request, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

/** Pedir al centro acceso, rectificación, supresión u oposición. */
export function useCreatePrivacyRequest(): PrivacyMutation<CreatePrivacyRequestDto> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreatePrivacyRequestDto) => privacyCreateRequest(centerId, request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getPrivacyListMyRequestsQueryKey(centerId) }),
  });

  return {
    run: (request, onDone) => {
      mutation.mutate(request, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
