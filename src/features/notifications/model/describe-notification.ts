import type { NotificationListResponseDtoNotificationsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format/numeric-date';
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

const TITLE_KEYS = {
  booking_created: 'notifications.bookingCreatedTitle',
  booking_cancelled: 'notifications.bookingCancelledTitle',
  booking_created_by_team: 'notifications.bookingCreatedByTeamTitle',
  booking_cancelled_by_team: 'notifications.bookingCancelledByTeamTitle',
  absence_added: 'notifications.absenceAddedTitle',
  booking_affected_by_absence: 'notifications.bookingAffectedByAbsenceTitle',
  routine_assigned: 'notifications.routineAssignedTitle',
} as const satisfies Record<NotificationItem['kind'], string>;

/** Los avisos de cancelación llevan un icono de aviso en lugar del de calendario. */
export function isCancellationNotification(kind: NotificationItem['kind']): boolean {
  return kind === 'booking_cancelled' || kind === 'booking_cancelled_by_team';
}

function describeAbsence(details: NotificationItem['data']): string {
  const from = formatNumericDate(details.startsOn ?? '');
  const range =
    details.startsOn === details.endsOn
      ? i18n.t('notifications.absenceSingleDay', { date: from })
      : i18n.t('notifications.absenceDateRange', {
          from,
          to: formatNumericDate(details.endsOn ?? ''),
        });
  const affected = i18n.t('notifications.absenceAffectedCount', {
    count: Number(details.affectedBookingCount ?? 0),
  });
  const sentence = i18n.t('notifications.absenceAddedDescription', {
    staffName: details.staffName ?? '',
    actorName: details.actorName ?? '',
    range,
  });
  return `${sentence} ${affected}`;
}

/**
 * El texto de un aviso. El servidor solo manda los datos (quién, qué, cuándo): la frase se escribe
 * aquí para que lleve el vocabulario de la app y se pueda traducir.
 */
export function describeNotification(
  notification: NotificationItem,
  timeZone: string,
): NotificationText {
  const { data, kind } = notification;
  const title = i18n.t(TITLE_KEYS[kind]);
  if (kind === 'absence_added') return { title, description: describeAbsence(data) };

  const when = formatWhen(data.startsAt ?? notification.createdAt, timeZone);
  const texts = {
    clientName: data.clientName ?? '',
    serviceName: data.serviceName ?? '',
    staffName: data.staffName ?? '',
    actorName: data.actorName ?? '',
    when,
  };
  if (kind === 'booking_created_by_team') {
    return { title, description: i18n.t('notifications.bookingCreatedByTeamDescription', texts) };
  }
  if (kind === 'booking_cancelled_by_team') {
    return { title, description: i18n.t('notifications.bookingCancelledByTeamDescription', texts) };
  }
  if (kind === 'booking_affected_by_absence') {
    return {
      title,
      description: i18n.t('notifications.bookingAffectedByAbsenceDescription', texts),
    };
  }
  return { title, description: i18n.t('notifications.bookingDescription', texts) };
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
