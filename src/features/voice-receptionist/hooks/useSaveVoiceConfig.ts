import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getVoiceGetOverviewQueryKey,
  voiceUpdateConfig,
} from '@/shared/api/generated/endpoints/voice-receptionist/voice-receptionist';
import type { UpdateVoiceConfigRequestDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

interface SaveVoiceConfig {
  saveConfig: (request: UpdateVoiceConfigRequestDto) => void;
  isSaving: boolean;
  isSaved: boolean;
  errorMessage: string | null;
}

/** Guarda los ajustes del contestador; no es optimista y recarga el estado al terminar. */
export function useSaveVoiceConfig(): SaveVoiceConfig {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: UpdateVoiceConfigRequestDto) => voiceUpdateConfig(centerId, request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getVoiceGetOverviewQueryKey(centerId) }),
  });

  return {
    saveConfig: (request) => {
      mutation.mutate(request);
    },
    isSaving: mutation.isPending,
    isSaved: mutation.isSuccess,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
