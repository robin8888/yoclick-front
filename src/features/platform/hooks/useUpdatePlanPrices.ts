import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { platformUpdatePlan } from '@/shared/api/generated/endpoints/platform/platform';
import type { UpdatePlatformPlanRequestDto } from '@/shared/api/generated/model';

type PlanId = Parameters<typeof platformUpdatePlan>[0];

interface UpdatePlanPrices {
  updatePrices: (
    request: { planId: PlanId; changes: UpdatePlatformPlanRequestDto },
    callbacks?: { onUpdated?: () => void },
  ) => void;
  isUpdating: boolean;
  updateErrorMessage: string | null;
  clearError: () => void;
}

const PLATFORM_KEY_PREFIX = '/v1/platform';

/**
 * Cambia el precio mensual, el anual o la cuota de alta de un plan. No es optimista: se espera al
 * servidor, que lo deja en la auditoría, y se recargan los planes, el resumen y la actividad.
 */
export function useUpdatePlanPrices(): UpdatePlanPrices {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ planId, changes }: { planId: PlanId; changes: UpdatePlatformPlanRequestDto }) =>
      platformUpdatePlan(planId, changes),
  });

  return {
    updatePrices: (request, callbacks) => {
      mutation.mutate(request, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({
              predicate: ({ queryKey }) =>
                typeof queryKey[0] === 'string' && queryKey[0].startsWith(PLATFORM_KEY_PREFIX),
            })
            .then(() => {
              callbacks?.onUpdated?.();
            });
        },
      });
    },
    isUpdating: mutation.isPending,
    updateErrorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    clearError: mutation.reset,
  };
}
