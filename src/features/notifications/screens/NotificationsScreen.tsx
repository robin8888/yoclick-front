import { useState } from 'react';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import type { NotificationListResponseDtoNotificationsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { NotificationRow } from '../components/NotificationRow';
import { PushPermissionCard } from '../components/PushPermissionCard';
import { useDeleteNotifications } from '../hooks/useDeleteNotifications';
import { useMarkNotificationsRead } from '../hooks/useMarkNotificationsRead';
import { useNotifications } from '../hooks/useNotifications';
import {
  describeNotification,
  formatNotificationAge,
  isCancellationNotification,
} from '../model/describe-notification';

interface NotificationListProps {
  notifications: readonly NotificationListResponseDtoNotificationsItem[];
  onNoticeOpen: (notificationId: string) => void;
  onNoticeDelete: (notificationId: string) => void;
}

/** Las filas de avisos: al tocar uno sin leer se marca como leído; la papelera lo quita. */
function NotificationList({
  notifications,
  onNoticeOpen,
  onNoticeDelete,
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
            isCancellation={isCancellationNotification(notification.kind)}
            onPress={() => {
              if (!notification.isRead) onNoticeOpen(notification.id);
            }}
            onDeletePress={() => {
              onNoticeDelete(notification.id);
            }}
          />
        );
      })}
    </>
  );
}

interface NoticeActionsProps {
  unreadCount: number;
  hasNotices: boolean;
  isBusy: boolean;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}

/** «Marcar leídos» (si hay sin leer) y «Borrar todos» (si hay avisos). */
function NoticeActions({
  unreadCount,
  hasNotices,
  isBusy,
  onMarkAllRead,
  onDeleteAll,
}: Readonly<NoticeActionsProps>): React.JSX.Element {
  return (
    <>
      {unreadCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          label={i18n.t('notifications.markAllRead')}
          isDisabled={isBusy}
          onPress={onMarkAllRead}
        />
      ) : null}
      {hasNotices ? (
        <Button
          variant="ghost"
          size="sm"
          leadingIconName="trash"
          label={i18n.t('notifications.deleteAll')}
          isDisabled={isBusy}
          onPress={onDeleteAll}
        />
      ) : null}
    </>
  );
}

type NotificationsQuery = ReturnType<typeof useNotifications>;

/** Error con reintento, esqueleto mientras carga o vacío. */
function NotificationsState({
  notifications,
}: Readonly<{ notifications: NotificationsQuery }>): React.JSX.Element {
  const isEmpty = notifications.isSuccess && notifications.data.notifications.length === 0;

  return (
    <>
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
      {isEmpty ? (
        <EmptyState
          iconName="bell"
          title={i18n.t('notifications.emptyTitle')}
          description={i18n.t('notifications.emptyDescription')}
          actionLabel={getSharedStateCopy().retryLabel}
          onActionPress={() => void notifications.refetch()}
        />
      ) : null}
    </>
  );
}

interface DeleteAllSheetProps {
  isVisible: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

function DeleteAllSheet({
  isVisible,
  isDeleting,
  onConfirm,
  onDismiss,
}: Readonly<DeleteAllSheetProps>): React.JSX.Element {
  return (
    <ConfirmSheet
      isVisible={isVisible}
      title={i18n.t('notifications.deleteAllTitle')}
      message={i18n.t('notifications.deleteAllMessage')}
      confirmLabel={i18n.t('notifications.deleteAllConfirm')}
      dismissLabel={i18n.t('notifications.deleteAllDismiss')}
      isConfirming={isDeleting}
      isDestructive
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}

/** Prototipo `inotifs`: los avisos, con «Marcar leídos», la papelera de cada uno y «Borrar todos». */
export function NotificationsScreen(): React.JSX.Element {
  const notifications = useNotifications();
  const marker = useMarkNotificationsRead();
  const deletion = useDeleteNotifications();
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  const list = notifications.data?.notifications ?? [];

  return (
    <ScreenTemplate title={i18n.t('notifications.title')}>
      <PushPermissionCard />
      <NoticeActions
        unreadCount={notifications.data?.unreadCount ?? 0}
        hasNotices={list.length > 0}
        isBusy={marker.isMarking || deletion.isDeleting}
        onMarkAllRead={marker.markAllRead}
        onDeleteAll={() => {
          setIsConfirmingDeleteAll(true);
        }}
      />
      <NotificationsState notifications={notifications} />
      <NotificationList
        notifications={list}
        onNoticeOpen={marker.markOneRead}
        onNoticeDelete={deletion.deleteOne}
      />
      <DeleteAllSheet
        isVisible={isConfirmingDeleteAll}
        isDeleting={deletion.isDeleting}
        onConfirm={() => {
          deletion.deleteAll(() => {
            setIsConfirmingDeleteAll(false);
          });
        }}
        onDismiss={() => {
          setIsConfirmingDeleteAll(false);
        }}
      />
    </ScreenTemplate>
  );
}
