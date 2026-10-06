import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getNotificationsListQueryOptions } from '@/shared/api/generated/endpoints/notifications/notifications';
import type { NotificationListResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

const NOTIFICATION_REFRESH_INTERVAL_MS = 60_000;

/**
 * Los avisos de quien ha entrado (nuevas reservas y cancelaciones). Se vuelven a pedir cada minuto
 * mientras la app está abierta: aún no hay avisos push, y así el contador de la campana se mantiene.
 */
export function useNotifications(): UseQueryResult<NotificationListResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getNotificationsListQueryOptions(centerId ?? '', undefined, {
      query: { enabled: centerId !== null, refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS },
    }),
  );
}

/** Cuántos avisos tiene sin leer; 0 mientras carga o si no se pueden pedir. */
export function useUnreadNotificationCount(): number {
  return useNotifications().data?.unreadCount ?? 0;
}
