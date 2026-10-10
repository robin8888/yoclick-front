import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import { getRoomsListQueryKey, roomsUpdate } from '@/shared/api/generated/endpoints/rooms/rooms';
import type { UpdateRoomRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { useActiveCenterId } from './useActiveCenterId';

const CONFLICT_STATUS = 409;

interface UpdateRoom {
  updateRoom: (request: UpdateRoomRequestDto) => void;
  isUpdating: boolean;
  errorMessage: string | null;
}

function describeUpdateFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return i18n.t('centerAdmin.rooms.duplicateName');
  }
  return getApiErrorMessage(error);
}

/** Cambia nombre, aforo o profesor de una sala; no es optimista y al terminar vuelve a pedir la lista. */
export function useUpdateRoom(roomId: string, onDone: () => void): UpdateRoom {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: UpdateRoomRequestDto) => roomsUpdate(centerId, roomId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getRoomsListQueryKey(centerId) }).then(onDone);
    },
  });

  return {
    updateRoom: (request) => {
      mutation.mutate(request);
    },
    isUpdating: mutation.isPending,
    errorMessage: mutation.isError ? describeUpdateFailure(mutation.error) : null,
  };
}
