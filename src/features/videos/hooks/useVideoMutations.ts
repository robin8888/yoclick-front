import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getTeamProfilesListQueryKey } from '@/shared/api/generated/endpoints/team-profiles/team-profiles';
import {
  getVideosGetPlanQueryKey,
  videosDelete,
} from '@/shared/api/generated/endpoints/videos/videos';

import { useActiveCenterId } from './useActiveCenterId';

interface VideoMutation<TInput> {
  run: (input: TInput, onDone?: () => void) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

/** `onSuccess` solo se envía si hay algo que hacer al terminar. */
function successOptions(onDone: (() => void) | undefined): { onSuccess?: () => void } {
  return onDone ? { onSuccess: onDone } : {};
}

/** Borrar libera espacio del plan y cambia el vídeo de presentación del equipo. */
export function useDeleteVideo(): VideoMutation<string> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (videoId: string) => videosDelete(centerId, videoId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: getVideosGetPlanQueryKey(centerId) }),
        queryClient.invalidateQueries({ queryKey: getTeamProfilesListQueryKey(centerId) }),
      ]),
  });

  return {
    run: (videoId, onDone) => {
      mutation.mutate(videoId, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
