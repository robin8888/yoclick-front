import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import {
  centersUpdateSettings,
  getCentersGetSettingsQueryKey,
} from '@/shared/api/generated/endpoints/centers/centers';

import type { OpeningHoursDraft } from '../model/opening-hours-draft';
import { useActiveCenterId } from './useActiveCenterId';

/**
 * Guarda el horario entero con `If-Match`: si otra persona del equipo lo cambió antes, el servidor
 * lo rechaza (412) en lugar de pisarlo. Al terminar vuelve a la pantalla anterior.
 */
export function useSaveOpeningHours(
  settingsVersion: string,
): UseMutationResult<unknown, Error, OpeningHoursDraft> {
  const router = useRouter();
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (openingHours: OpeningHoursDraft) =>
      centersUpdateSettings(
        centerId,
        { openingHours },
        { headers: { 'If-Match': settingsVersion } },
      ),
    onSuccess: () => {
      void queryClient
        .invalidateQueries({ queryKey: getCentersGetSettingsQueryKey(centerId) })
        .then(router.back);
    },
  });
}
