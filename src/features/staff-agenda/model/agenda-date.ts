import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

const MILLISECONDS_PER_DAY = 86_400_000;
const TWO_DIGITS = 2;
const NOON_HOUR = 12;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function padToTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

function formatCalendarDay(day: Date): string {
  return `${String(day.getUTCFullYear())}-${padToTwoDigits(day.getUTCMonth() + 1)}-${padToTwoDigits(day.getUTCDate())}`;
}

/** Hoy como `YYYY-MM-DD` en la zona del centro (no la del móvil). */
export function getTodayIsoDate(now: Date, timeZone: string): string {
  const { year, month, day } = getZonedDateParts(now, timeZone);
  return `${String(year)}-${padToTwoDigits(month)}-${padToTwoDigits(day)}`;
}

/** Suma o resta días de calendario a una fecha `YYYY-MM-DD`; `null` si la fecha no es válida. */
export function shiftIsoDate(isoDate: string, dayOffset: number): string | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) return null;
  const [, year, month, day] = match;
  const noonUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), NOON_HOUR);
  return formatCalendarDay(new Date(noonUtc + dayOffset * MILLISECONDS_PER_DAY));
}
