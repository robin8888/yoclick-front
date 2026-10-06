import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import type { NotificationListResponseDtoNotificationsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { NotificationRow } from '../components/NotificationRow';
import { useMarkNotificationsRead } from '../hooks/useMarkNotificationsRead';
import { useNotifications } from '../hooks/useNotifications';
import { describeNotification, formatNotificationAge } from '../model/describe-notification';

interface NotificationListProps {
  notifications: readonly NotificationListResponseDtoNotificationsItem[];
  onNoticeOpen: (notificationId: string) => void;
}

/** Las filas de avisos: al tocar uno sin leer se marca como leído. */
function NotificationList({
  notifications,
  onNoticeOpen,
}: Readonly<NotificationListProps>): React.JSX.Element {
  const now = new Date();

  return (
    <>
      {notifications.map((notification) => {
        const text = describeNotification(notification, DEFAULT_CENTER_TIME_ZONE);
        return (
          <NotificationRow
            key={notification.id}
            title={text.title}
            description={text.description}
            ageLabel={formatNotificationAge(notification.createdAt, now, DEFAULT_CENTER_TIME_ZONE)}
            isRead={notification.isRead}
            isCancellation={notification.kind === 'booking_cancelled'}
            onPress={() => {
              if (!notification.isRead) onNoticeOpen(notification.id);
            }}
          />
        );
      })}
    </>
  );
}

/** Prototipo `inotifs`: los avisos del centro, con «Marcar leídos». */
export function NotificationsScreen(): React.JSX.Element {
  const notifications = useNotifications();
  const marker = useMarkNotificationsRead();
  const list = notifications.data?.notifications ?? [];

  return (
    <ScreenTemplate title={i18n.t('notifications.title')}>
      {(notifications.data?.unreadCount ?? 0) > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          label={i18n.t('notifications.markAllRead')}
          isDisabled={marker.isMarking}
          onPress={marker.markAllRead}
        />
      ) : null}
      {notifications.isError ? (
        <LoadErrorState
          title={i18n.t('notifications.loadError')}
          error={notifications.error}
          onRetry={() => void notifications.refetch()}
          isRetrying={notifications.isFetching}
        />
      ) : null}
      {notifications.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {notifications.isSuccess && list.length === 0 ? (
        <EmptyState
          iconName="bell"
          title={i18n.t('notifications.emptyTitle')}
          description={i18n.t('notifications.emptyDescription')}
          actionLabel={getSharedStateCopy().retryLabel}
          onActionPress={() => void notifications.refetch()}
        />
      ) : null}
      <NotificationList notifications={list} onNoticeOpen={marker.markOneRead} />
    </ScreenTemplate>
  );
}
