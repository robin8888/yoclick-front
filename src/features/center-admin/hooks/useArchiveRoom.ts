import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getRoomsListQueryKey, roomsArchive } from '@/shared/api/generated/endpoints/rooms/rooms';
import { getServicesListQueryKey } from '@/shared/api/generated/endpoints/services/services';

import { useActiveCenterId } from './useActiveCenterId';

interface ArchiveRoom {
  archiveRoom: (roomId: string, onDone: () => void) => void;
  isArchiving: boolean;
  errorMessage: string | null;
}

/** Quita una sala; los servicios que la usaban quedan sin sala fija, así que también se recargan. */
export function useArchiveRoom(): ArchiveRoom {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (roomId: string) => roomsArchive(centerId, roomId),
  });

  return {
    archiveRoom: (roomId, onDone) => {
      mutation.mutate(roomId, {
        onSuccess: () => {
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: getRoomsListQueryKey(centerId) }),
            queryClient.invalidateQueries({ queryKey: getServicesListQueryKey(centerId) }),
          ]).then(onDone);
        },
      });
    },
    isArchiving: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
