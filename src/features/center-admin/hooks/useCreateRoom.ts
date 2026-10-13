import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import { getRoomsListQueryKey, roomsCreate } from '@/shared/api/generated/endpoints/rooms/rooms';
import type { CreateRoomRequestDto, RoomResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { useActiveCenterId } from './useActiveCenterId';

const CONFLICT_STATUS = 409;

interface CreateRoom {
  createRoom: (request: CreateRoomRequestDto) => void;
  isCreating: boolean;
  errorMessage: string | null;
}

function describeCreationFailure(error: unknown): string {
  // El único conflicto posible es el nombre repetido: se dice con palabras del centro.
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return i18n.t('centerAdmin.rooms.duplicateName');
  }
  return getApiErrorMessage(error);
}

/** Añade una sala; no es optimista y, al terminar, vuelve a pedir la lista y avisa con la sala creada. */
export function useCreateRoom(onCreated: (room: RoomResponseDto) => void): CreateRoom {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateRoomRequestDto) => roomsCreate(centerId, request),
    onSuccess: (room) => {
      void queryClient.invalidateQueries({ queryKey: getRoomsListQueryKey(centerId) }).then(() => {
        onCreated(room);
      });
    },
  });

  return {
    createRoom: (request) => {
      mutation.mutate(request);
    },
    isCreating: mutation.isPending,
    errorMessage: mutation.isError ? describeCreationFailure(mutation.error) : null,
  };
}
