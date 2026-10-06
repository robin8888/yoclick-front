import type { ActivityResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

const MILLISECONDS_PER_DAY = 86_400_000;

/** Lo que cuenta sobre qué o quién fue: «creó el servicio “Yoga”». */
const WITH_SUBJECT_KEYS = {
  service_created: 'centerAdmin.security.activity.withSubject.service_created',
  service_updated: 'centerAdmin.security.activity.withSubject.service_updated',
  room_created: 'centerAdmin.security.activity.withSubject.room_created',
  client_updated: 'centerAdmin.security.activity.withSubject.client_updated',
  group_created: 'centerAdmin.security.activity.withSubject.group_created',
  team_member_updated: 'centerAdmin.security.activity.withSubject.team_member_updated',
  booking_created_by_team: 'centerAdmin.security.activity.withSubject.booking_created_by_team',
} as const;

/** El resto de acciones se cuentan sin nombre propio: «archivó un servicio». */
const GENERIC_KEYS = {
  service_archived: 'centerAdmin.security.activity.generic.service_archived',
  room_archived: 'centerAdmin.security.activity.generic.room_archived',
  group_archived: 'centerAdmin.security.activity.generic.group_archived',
  team_member_removed: 'centerAdmin.security.activity.generic.team_member_removed',
  settings_updated: 'centerAdmin.security.activity.generic.settings_updated',
  join_code_regenerated: 'centerAdmin.security.activity.generic.join_code_regenerated',
} as const;

function isSubjectKind(kind: string): kind is keyof typeof WITH_SUBJECT_KEYS {
  return Object.hasOwn(WITH_SUBJECT_KEYS, kind);
}

function isGenericKind(kind: string): kind is keyof typeof GENERIC_KEYS {
  return Object.hasOwn(GENERIC_KEYS, kind);
}

/** «cambió el servicio “Yoga”»; un tipo que esta versión de la app no conoce se dice en general. */
export function describeActivityAction(entry: ActivityResponseDtoEntriesItem): string {
  if (isSubjectKind(entry.kind) && entry.subject !== null) {
    return i18n.t(WITH_SUBJECT_KEYS[entry.kind], { subject: entry.subject });
  }
  if (isGenericKind(entry.kind)) return i18n.t(GENERIC_KEYS[entry.kind]);
  return i18n.t('centerAdmin.security.activity.unknown');
}

function toDayNumber(dateInput: string | Date, timeZone: string): number {
  const { year, month, day } = getZonedDateParts(dateInput, timeZone);
  return Math.floor(Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY);
}

/** «Hoy 09:12», «Ayer 21:30» o «jue 1 oct», en la zona horaria del centro. */
export function formatActivityMoment(isoInstant: string, now: Date, timeZone: string): string {
  const dayDifference = toDayNumber(now, timeZone) - toDayNumber(isoInstant, timeZone);
  const time = formatTime24h(isoInstant, timeZone);
  if (dayDifference === 0) return i18n.t('centerAdmin.security.activity.today', { time });
  if (dayDifference === 1) return i18n.t('centerAdmin.security.activity.yesterday', { time });
  return formatShortDate(isoInstant, timeZone);
}
