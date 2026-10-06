import type { NotificationListResponseDtoNotificationsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';

type NotificationItem = NotificationListResponseDtoNotificationsItem;

export interface NotificationText {
  title: string;
  description: string;
}

const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

/** «jue 1 oct · 18:00» en la zona del centro. */
function formatWhen(startsAt: string, timeZone: string): string {
  return `${formatShortDate(startsAt, timeZone)} · ${formatTime24h(startsAt, timeZone)}`;
}

/**
 * El texto de un aviso. El servidor solo manda los datos (quién, qué, cuándo): la frase se escribe
 * aquí para que lleve el vocabulario de la app y se pueda traducir.
 */
export function describeNotification(
  notification: NotificationItem,
  timeZone: string,
): NotificationText {
  const { data } = notification;
  const when = formatWhen(data.startsAt ?? notification.createdAt, timeZone);
  const description = i18n.t('notifications.bookingDescription', {
    clientName: data.clientName ?? '',
    serviceName: data.serviceName ?? '',
    when,
  });
  return {
    title: i18n.t(
      notification.kind === 'booking_created'
        ? 'notifications.bookingCreatedTitle'
        : 'notifications.bookingCancelledTitle',
    ),
    description,
  };
}

/** «Ahora», «hace 5 min», «hace 3 h» o la fecha corta para lo que tiene más de un día. */
export function formatNotificationAge(createdAt: string, now: Date, timeZone: string): string {
  const minutes = Math.floor((now.getTime() - Date.parse(createdAt)) / MILLISECONDS_PER_MINUTE);
  if (minutes < 1) return i18n.t('notifications.justNow');
  if (minutes < MINUTES_PER_HOUR) return i18n.t('notifications.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return i18n.t('notifications.hoursAgo', { count: hours });
  return formatShortDate(createdAt, timeZone);
}
