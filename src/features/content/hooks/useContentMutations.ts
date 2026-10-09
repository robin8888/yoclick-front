import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  contentAssign,
  contentDelete,
  contentUpdate,
  getContentListMineQueryKey,
  getContentListQueryKey,
} from '@/shared/api/generated/endpoints/content/content';
import type {
  AssignContentRequestDtoTargetsItem,
  UpdateContentRequestDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface ContentMutation<TInput> {
  run: (input: TInput, onDone?: () => void) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

/** `onSuccess` solo se envía si hay algo que hacer al terminar. */
function successOptions(onDone: (() => void) | undefined): { onSuccess?: () => void } {
  return onDone ? { onSuccess: onDone } : {};
}

function useRefreshContent(): () => Promise<unknown> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getContentListQueryKey(centerId) }),
      queryClient.invalidateQueries({ queryKey: getContentListMineQueryKey(centerId) }),
    ]);
}

/** A quién se enseña una pieza: la lista que llega sustituye a la anterior. */
export function useAssignContent(): ContentMutation<{
  contentId: string;
  targets: AssignContentRequestDtoTargetsItem[];
}> {
  const centerId = useActiveCenterId();
  const refreshContent = useRefreshContent();
  const mutation = useMutation({
    mutationFn: ({
      contentId,
      targets,
    }: {
      contentId: string;
      targets: AssignContentRequestDtoTargetsItem[];
    }) => contentAssign(centerId, contentId, { targets }),
    onSuccess: refreshContent,
  });

  return {
    run: (input, onDone) => {
      mutation.mutate(input, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

/** Cambia el título, el nivel o la necesidad de una pieza. */
export function useUpdateContent(): ContentMutation<{
  contentId: string;
  changes: UpdateContentRequestDto;
}> {
  const centerId = useActiveCenterId();
  const refreshContent = useRefreshContent();
  const mutation = useMutation({
    mutationFn: ({ contentId, changes }: { contentId: string; changes: UpdateContentRequestDto }) =>
      contentUpdate(centerId, contentId, changes),
    onSuccess: refreshContent,
  });

  return {
    run: (input, onDone) => {
      mutation.mutate(input, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

/** Borrar libera el espacio del plan: el fichero o el vídeo se quitan del servicio. */
export function useDeleteContent(): ContentMutation<string> {
  const centerId = useActiveCenterId();
  const refreshContent = useRefreshContent();
  const mutation = useMutation({
    mutationFn: (contentId: string) => contentDelete(centerId, contentId),
    onSuccess: refreshContent,
  });

  return {
    run: (contentId, onDone) => {
      mutation.mutate(contentId, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
