import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getNotificationsListQueryKey,
  notificationsRead,
  notificationsReadAll,
} from '@/shared/api/generated/endpoints/notifications/notifications';
import { useSessionStore } from '@/shared/auth/session-store';

interface MarkNotificationsRead {
  markAllRead: () => void;
  markOneRead: (notificationId: string) => void;
  isMarking: boolean;
}

/**
 * Marcar un aviso o todos como leídos. Es de las pocas acciones optimistas permitidas (CLAUDE.md):
 * el contador baja al momento y se vuelve a pedir la lista para dejarla como está en el servidor.
 */
export function useMarkNotificationsRead(): MarkNotificationsRead {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const refreshList = (): void => {
    void queryClient.invalidateQueries({ queryKey: getNotificationsListQueryKey(centerId) });
  };
  const markAll = useMutation({
    mutationFn: () => notificationsReadAll(centerId),
    onSettled: refreshList,
  });
  const markOne = useMutation({
    mutationFn: (notificationId: string) => notificationsRead(centerId, notificationId),
    onSettled: refreshList,
  });

  return {
    markAllRead: () => {
      markAll.mutate();
    },
    markOneRead: (notificationId) => {
      markOne.mutate(notificationId);
    },
    isMarking: markAll.isPending || markOne.isPending,
  };
}
