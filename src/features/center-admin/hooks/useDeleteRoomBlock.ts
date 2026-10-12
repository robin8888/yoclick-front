import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getAgendaGetRoomDayQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getRoomBlocksListOfRoomQueryKey,
  roomBlocksDelete,
} from '@/shared/api/generated/endpoints/rooms/rooms';

import { useActiveCenterId } from './useActiveCenterId';

interface DeleteRoomBlock {
  deleteBlock: (blockId: string, onDone: () => void) => void;
  isDeleting: boolean;
  errorMessage: string | null;
}

/** Quita un bloqueo: el espacio vuelve a estar disponible en ese tramo. */
export function useDeleteRoomBlock(roomId: string): DeleteRoomBlock {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (blockId: string) => roomBlocksDelete(centerId, roomId, blockId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getRoomBlocksListOfRoomQueryKey(centerId, roomId),
      });
      void queryClient.invalidateQueries({ queryKey: getAgendaGetRoomDayQueryKey(centerId) });
    },
  });

  return {
    deleteBlock: (blockId, onDone) => {
      mutation.mutate(blockId, { onSuccess: onDone });
    },
    isDeleting: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
