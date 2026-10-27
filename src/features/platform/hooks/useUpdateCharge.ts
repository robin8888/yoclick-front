import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { platformUpdateCharge } from '@/shared/api/generated/endpoints/platform/platform';
import type { UpdatePlatformChargeRequestDto } from '@/shared/api/generated/model';

import { invalidatePlatformQueries } from './invalidatePlatformQueries';

interface UpdateCharge {
  updateCharge: (
    request: { chargeId: string; changes: UpdatePlatformChargeRequestDto },
    onUpdated: () => void,
  ) => void;
  isUpdating: boolean;
  updateErrorMessage: string | null;
  clearError: () => void;
}

/** Cambia el estado de un cobro o su referencia de factura. No es optimista: se espera al servidor. */
export function useUpdateCharge(): UpdateCharge {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      chargeId,
      changes,
    }: {
      chargeId: string;
      changes: UpdatePlatformChargeRequestDto;
    }) => platformUpdateCharge(chargeId, changes),
  });

  return {
    updateCharge: (request, onUpdated) => {
      mutation.mutate(request, {
        onSuccess: () => {
          void invalidatePlatformQueries(queryClient).then(onUpdated);
        },
      });
    },
    isUpdating: mutation.isPending,
    updateErrorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    clearError: mutation.reset,
  };
}
