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
  booking_rescheduled: 'notifications.bookingRescheduledTitle',
  booking_rescheduled_by_team: 'notifications.bookingRescheduledByTeamTitle',
  absence_added: 'notifications.absenceAddedTitle',
  booking_affected_by_absence: 'notifications.bookingAffectedByAbsenceTitle',
  routine_assigned: 'notifications.routineAssignedTitle',
  routine_updated: 'notifications.routineUpdatedTitle',
  staff_video_submitted: 'notifications.staffVideoSubmittedTitle',
  staff_video_reviewed: 'notifications.staffVideoReviewedTitle',
  privacy_request_received: 'notifications.privacyRequestReceivedTitle',
  privacy_request_resolved: 'notifications.privacyRequestResolvedTitle',
  staff_profile_submitted: 'notifications.staffProfileSubmittedTitle',
  staff_profile_reviewed: 'notifications.staffProfileReviewedTitle',
  staff_review_received: 'notifications.staffReviewReceivedTitle',
} as const satisfies Record<NotificationItem['kind'], string>;

const DESCRIPTION_KEYS = {
  booking_created: 'notifications.bookingDescription',
  booking_cancelled: 'notifications.bookingDescription',
  booking_created_by_team: 'notifications.bookingCreatedByTeamDescription',
  booking_cancelled_by_team: 'notifications.bookingCancelledByTeamDescription',
  booking_rescheduled: 'notifications.bookingDescription',
  booking_rescheduled_by_team: 'notifications.bookingRescheduledByTeamDescription',
  absence_added: 'notifications.absenceAddedDescription',
  booking_affected_by_absence: 'notifications.bookingAffectedByAbsenceDescription',
  routine_assigned: 'notifications.routineAssignedDescription',
  routine_updated: 'notifications.routineUpdatedDescription',
  staff_video_submitted: 'notifications.staffVideoSubmittedDescription',
  staff_video_reviewed: 'notifications.staffVideoReviewedDescription',
  privacy_request_received: 'notifications.privacyRequestReceivedDescription',
  privacy_request_resolved: 'notifications.privacyRequestCompletedDescription',
  staff_profile_submitted: 'notifications.staffProfileSubmittedDescription',
  staff_profile_reviewed: 'notifications.staffProfileApprovedDescription',
  staff_review_received: 'notifications.staffReviewReceivedDescription',
} as const satisfies Record<NotificationItem['kind'], string>;

const PRIVACY_RIGHT_KEYS = {
  access: 'privacy.kinds.access',
  rectification: 'privacy.kinds.rectification',
  erasure: 'privacy.kinds.erasure',
  objection: 'privacy.kinds.objection',
} as const;

type PrivacyRightKind = keyof typeof PRIVACY_RIGHT_KEYS;

function describePrivacyRight(requestKind: string | undefined): string {
  const isKnownRight = requestKind !== undefined && requestKind in PRIVACY_RIGHT_KEYS;
  return isKnownRight ? i18n.t(PRIVACY_RIGHT_KEYS[requestKind as PrivacyRightKind]) : '';
}

/** Una solicitud rechazada o un perfil con cambios pedidos tienen su propia frase: el motivo se lee dentro de la app. */
function resolveDescriptionKey(
  kind: NotificationItem['kind'],
  noticeData: NotificationItem['data'],
):
  | (typeof DESCRIPTION_KEYS)[NotificationItem['kind']]
  | 'notifications.privacyRequestRejectedDescription'
  | 'notifications.staffProfileChangesDescription' {
  const isRejected = kind === 'privacy_request_resolved' && noticeData.outcome === 'rejected';
  if (isRejected) return 'notifications.privacyRequestRejectedDescription';
  const hasChangesRequested =
    kind === 'staff_profile_reviewed' && noticeData.outcome === 'changes_requested';
  if (hasChangesRequested) return 'notifications.staffProfileChangesDescription';
  return DESCRIPTION_KEYS[kind];
}

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

interface NoticeTexts {
  clientName: string;
  serviceName: string;
  staffName: string;
  actorName: string;
  routineName: string;
  uploaderName: string;
  right: string;
  authorLabel: string;
  rating: string;
  when: string;
}

function buildNoticeTexts(notification: NotificationItem, timeZone: string): NoticeTexts {
  const noticeData = notification.data;
  return {
    clientName: noticeData.clientName ?? '',
    serviceName: noticeData.serviceName ?? '',
    staffName: noticeData.staffName ?? '',
    actorName: noticeData.actorName ?? '',
    routineName: noticeData.routineName ?? '',
    uploaderName: noticeData.uploaderName ?? '',
    right: describePrivacyRight(noticeData.requestKind),
    authorLabel: noticeData.authorLabel ?? '',
    rating: noticeData.rating ?? '',
    when: formatWhen(noticeData.startsAt ?? notification.createdAt, timeZone),
  };
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

  const texts = buildNoticeTexts(notification, timeZone);
  return { title, description: i18n.t(resolveDescriptionKey(kind, noticeData), { ...texts }) };
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
