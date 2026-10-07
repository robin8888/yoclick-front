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
  staff_video_submitted: 'notifications.staffVideoSubmittedTitle',
  staff_video_reviewed: 'notifications.staffVideoReviewedTitle',
} as const satisfies Record<NotificationItem['kind'], string>;

const DESCRIPTION_KEYS = {
  booking_created: 'notifications.bookingDescription',
  booking_cancelled: 'notifications.bookingDescription',
  booking_created_by_team: 'notifications.bookingCreatedByTeamDescription',
  booking_cancelled_by_team: 'notifications.bookingCancelledByTeamDescription',
  absence_added: 'notifications.absenceAddedDescription',
  booking_affected_by_absence: 'notifications.bookingAffectedByAbsenceDescription',
  routine_assigned: 'notifications.routineAssignedDescription',
  staff_video_submitted: 'notifications.staffVideoSubmittedDescription',
  staff_video_reviewed: 'notifications.staffVideoReviewedDescription',
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
  const { data: noticeData, kind } = notification;
  const title = i18n.t(TITLE_KEYS[kind]);
  if (kind === 'absence_added') return { title, description: describeAbsence(noticeData) };

  const texts = {
    clientName: noticeData.clientName ?? '',
    serviceName: noticeData.serviceName ?? '',
    staffName: noticeData.staffName ?? '',
    actorName: noticeData.actorName ?? '',
    routineName: noticeData.routineName ?? '',
    uploaderName: noticeData.uploaderName ?? '',
    when: formatWhen(noticeData.startsAt ?? notification.createdAt, timeZone),
  };
  return { title, description: i18n.t(DESCRIPTION_KEYS[kind], texts) };
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
