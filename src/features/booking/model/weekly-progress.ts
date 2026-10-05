import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

/** Objetivo semanal fijo del prototipo; hasta que el centro lo configure (docs/api-requests.md). */
export const WEEKLY_GOAL_SESSION_COUNT = 4;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;
const MONDAY_FIRST_OFFSET = 6;

function toLocalDayNumber(isoDate: string | Date, timeZone: string): number {
  const { year, month, day } = getZonedDateParts(isoDate, timeZone);
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

function toDaysSinceMonday(now: Date, timeZone: string): number {
  const { weekdayIndex } = getZonedDateParts(now, timeZone);
  return (weekdayIndex + MONDAY_FIRST_OFFSET) % DAYS_PER_WEEK;
}

/** Cuántas de las fechas caen en la semana (lunes a domingo) de `now`, en la zona del centro. */
export function countSessionsInCurrentWeek(
  sessionStartsAtIsoList: readonly string[],
  now: Date,
  timeZone: string,
): number {
  const weekStartDay = toLocalDayNumber(now, timeZone) - toDaysSinceMonday(now, timeZone);
  return sessionStartsAtIsoList.filter((startsAtIso) => {
    const sessionDay = toLocalDayNumber(startsAtIso, timeZone);
    return sessionDay >= weekStartDay && sessionDay < weekStartDay + DAYS_PER_WEEK;
  }).length;
}
