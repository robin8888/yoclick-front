import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getRoomBlocksListOfRoomQueryKey,
  roomBlocksCreate,
} from '@/shared/api/generated/endpoints/rooms/rooms';
import type { CreateRoomBlockRequestDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface CreateRoomBlock {
  createBlock: (request: CreateRoomBlockRequestDto, onDone: () => void) => void;
  isCreating: boolean;
  errorMessage: string | null;
}

/** Bloquea un espacio en un tramo; el servidor rechaza tramos con citas (`ROOM_HAS_BOOKINGS`). */
export function useCreateRoomBlock(roomId: string): CreateRoomBlock {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateRoomBlockRequestDto) => roomBlocksCreate(centerId, roomId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getRoomBlocksListOfRoomQueryKey(centerId, roomId),
      });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    createBlock: (request, onDone) => {
      mutation.mutate(request, { onSuccess: onDone });
    },
    isCreating: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
