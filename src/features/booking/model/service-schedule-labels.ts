import type { ServiceListResponseDtoServicesItemSchedulesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

type ServiceSchedule = ServiceListResponseDtoServicesItemSchedulesItem;

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function describeWeekday(weekday: number): string {
  const key = WEEKDAY_KEYS[weekday - 1] ?? 'mon';
  return i18n.t(`centerAdmin.schedules.weekdayShort.${key}`);
}

/** «lun», «lun y mié», «lun, mié y vie». */
function joinWeekdays(weekdays: readonly number[]): string {
  const labels = weekdays.map(describeWeekday);
  const last = labels.pop();
  if (last === undefined) return '';
  return labels.length === 0 ? last : `${labels.join(', ')} ${i18n.t('booking.book.and')} ${last}`;
}

function describeGroup(schedule: ServiceSchedule, weekdays: readonly number[]): string {
  const parts = [
    joinWeekdays(weekdays),
    `${schedule.startsAtTime}–${schedule.endsAtTime}`,
    ...(schedule.room === null ? [] : [schedule.room.name]),
    i18n.t('booking.book.withTeacher', { name: schedule.teacherName }),
  ];
  return parts.join(' · ');
}

/**
 * Los horarios de un servicio, una línea por franja: los días que comparten hora, sala y profesor
 * van juntos («lun y mié · 18:00–19:00 · Sala 1 · con Marta»).
 */
export function describeServiceSchedules(schedules: readonly ServiceSchedule[]): string[] {
  const groups = new Map<string, { schedule: ServiceSchedule; weekdays: number[] }>();
  for (const schedule of schedules) {
    const key = [
      schedule.startsAtTime,
      schedule.endsAtTime,
      schedule.room?.id ?? '',
      schedule.teacherName,
    ].join('|');
    const group = groups.get(key) ?? { schedule, weekdays: [] };
    group.weekdays.push(schedule.weekday);
    groups.set(key, group);
  }
  return [...groups.values()].map(({ schedule, weekdays }) =>
    describeGroup(
      schedule,
      [...new Set(weekdays)].sort((left, right) => left - right),
    ),
  );
}
