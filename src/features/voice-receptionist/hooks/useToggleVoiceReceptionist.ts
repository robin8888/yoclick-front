import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getVoiceGetOverviewQueryKey,
  voiceDisable,
  voiceEnable,
} from '@/shared/api/generated/endpoints/voice-receptionist/voice-receptionist';
import { useSessionStore } from '@/shared/auth/session-store';

interface ToggleVoiceReceptionist {
  toggle: (shouldEnable: boolean) => void;
  isToggling: boolean;
  errorMessage: string | null;
}

/** Enciende o apaga el contestador. No es optimista: el servidor puede negarse (sin número, etc.). */
export function useToggleVoiceReceptionist(): ToggleVoiceReceptionist {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (shouldEnable: boolean) =>
      shouldEnable ? voiceEnable(centerId) : voiceDisable(centerId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getVoiceGetOverviewQueryKey(centerId) }),
  });

  return {
    toggle: (shouldEnable) => {
      mutation.mutate(shouldEnable);
    },
    isToggling: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
