import { i18n } from '@/shared/i18n';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function describeWeekday(weekday: number): string {
  const key = WEEKDAY_KEYS[weekday - 1] ?? 'mon';
  return i18n.t(`centerAdmin.schedules.weekdayShort.${key}`);
}

interface ClassMetaInput {
  roomName: string | null;
  weekdays: readonly number[];
  startsAtTime: string;
  enrolledCount: number;
}

/** «lun, mié · 18:00 · Sala 1 · 3 apuntadas»: cuándo, dónde y cuánta gente tiene la clase. */
export function describeClassMeta(entry: ClassMetaInput): string {
  const days = [...new Set(entry.weekdays)].sort((left, right) => left - right);
  const parts = [
    `${days.map(describeWeekday).join(', ')} ${entry.startsAtTime}`,
    ...(entry.roomName === null ? [] : [entry.roomName]),
    i18n.t('chat.group.enrolledCount', { count: entry.enrolledCount }),
  ];
  return parts.join(' · ');
}
