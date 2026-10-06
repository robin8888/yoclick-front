import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  centersUpdateSettings,
  getCentersGetSettingsQueryKey,
} from '@/shared/api/generated/endpoints/centers/centers';
import type { UpdateCenterSettingsRequestDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface SaveCenterSettings {
  saveSettings: (patch: UpdateCenterSettingsRequestDto, onSaved?: () => void) => void;
  isSaving: boolean;
  saveErrorMessage: string | null;
}

/**
 * Guarda cambios de los datos del centro con `If-Match`: si otra persona los cambió antes, el
 * servidor lo rechaza (412) en lugar de pisarlos. No es optimista.
 */
export function useSaveCenterSettings(settingsVersion: string): SaveCenterSettings {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (patch: UpdateCenterSettingsRequestDto) =>
      centersUpdateSettings(centerId, patch, { headers: { 'If-Match': settingsVersion } }),
  });

  return {
    saveSettings: (patch, onSaved) => {
      mutation.mutate(patch, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getCentersGetSettingsQueryKey(centerId) })
            .then(onSaved);
        },
      });
    },
    isSaving: mutation.isPending,
    saveErrorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
