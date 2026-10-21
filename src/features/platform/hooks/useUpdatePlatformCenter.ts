import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { platformUpdateCenter } from '@/shared/api/generated/endpoints/platform/platform';
import type { UpdatePlatformCenterRequestDto } from '@/shared/api/generated/model';

interface UpdatePlatformCenter {
  updateCenter: (
    changes: UpdatePlatformCenterRequestDto,
    callbacks?: { onUpdated?: () => void; onFailed?: () => void },
  ) => void;
  isUpdating: boolean;
  updateErrorMessage: string | null;
  clearError: () => void;
}

const PLATFORM_KEY_PREFIX = '/v1/platform';

/**
 * Cambia el estado, la prueba o el tope de un centro. No es optimista: se espera al servidor, que deja
 * el cambio en el registro de auditoría, y se recargan el centro, la lista, el resumen y la actividad.
 */
export function useUpdatePlatformCenter(centerId: string): UpdatePlatformCenter {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (changes: UpdatePlatformCenterRequestDto) =>
      platformUpdateCenter(centerId, changes),
  });

  return {
    updateCenter: (changes, callbacks) => {
      mutation.mutate(changes, {
        onError: () => {
          callbacks?.onFailed?.();
        },
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
