import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import { getPassesMineQueryKey } from '@/shared/api/generated/endpoints/passes/passes';
import { passesRequest } from '@/shared/api/generated/endpoints/rates/rates';
import { i18n } from '@/shared/i18n';

import { useActiveCenterId } from './useActiveCenterId';

const CONFLICT_STATUS = 409;

interface RequestPass {
  requestPass: (rateId: string) => void;
  isRequesting: boolean;
  errorMessage: string | null;
}

function describeRequestFailure(error: unknown): string {
  // El único conflicto posible es que ya lo tenga pedido y el centro no lo haya activado.
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return i18n.t('passes.alreadyRequested');
  }
  return getApiErrorMessage(error);
}

/** Pide un bono al centro; no es optimista: se espera al servidor y se recarga la lista. */
export function useRequestPass(): RequestPass {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (rateId: string) => passesRequest(centerId, rateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getPassesMineQueryKey(centerId) });
    },
  });

  return {
    requestPass: (rateId) => {
      mutation.mutate(rateId);
    },
    isRequesting: mutation.isPending,
    errorMessage: mutation.isError ? describeRequestFailure(mutation.error) : null,
  };
}
