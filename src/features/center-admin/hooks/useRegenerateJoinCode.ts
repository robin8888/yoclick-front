import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  centersRegenerateJoinCode,
  getCentersGetSettingsQueryKey,
} from '@/shared/api/generated/endpoints/centers/centers';

import { useActiveCenterId } from './useActiveCenterId';

interface RegenerateJoinCode {
  regenerateJoinCode: (onRegenerated: (joinCode: string) => void) => void;
  isRegenerating: boolean;
  errorMessage: string | null;
}

/** Cambia el código del centro (el QR y el enlace anteriores dejan de valer). No es optimista. */
export function useRegenerateJoinCode(): RegenerateJoinCode {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: () => centersRegenerateJoinCode(centerId) });

  return {
    regenerateJoinCode: (onRegenerated) => {
      mutation.mutate(undefined, {
        onSuccess: ({ joinCode }) => {
          void queryClient
            .invalidateQueries({ queryKey: getCentersGetSettingsQueryKey(centerId) })
            .then(() => {
              onRegenerated(joinCode);
            });
        },
      });
    },
    isRegenerating: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
