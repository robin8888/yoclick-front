import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getNotificationsListQueryKey,
  notificationsDelete,
  notificationsDeleteAll,
} from '@/shared/api/generated/endpoints/notifications/notifications';
import { useSessionStore } from '@/shared/auth/session-store';

interface DeleteNotifications {
  deleteOne: (notificationId: string) => void;
  deleteAll: (onDeleted: () => void) => void;
  isDeleting: boolean;
}

/**
 * Quitar un aviso o todos de la lista (en el servidor es un borrado lógico). No es optimista: se
 * espera al servidor y se vuelve a pedir la lista, así lo que se ve es lo que hay.
 */
export function useDeleteNotifications(): DeleteNotifications {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const refreshList = (): void => {
    void queryClient.invalidateQueries({ queryKey: getNotificationsListQueryKey(centerId) });
  };
  const deleteOneMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsDelete(centerId, notificationId),
    onSettled: refreshList,
  });
  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsDeleteAll(centerId),
    onSettled: refreshList,
  });

  return {
    deleteOne: (notificationId) => {
      deleteOneMutation.mutate(notificationId);
    },
    deleteAll: (onDeleted) => {
      deleteAllMutation.mutate(undefined, { onSuccess: onDeleted });
    },
    isDeleting: deleteOneMutation.isPending || deleteAllMutation.isPending,
  };
}
