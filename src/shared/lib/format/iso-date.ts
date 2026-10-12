import { getZonedDateParts } from './zoned-date-parts';

const MILLISECONDS_PER_DAY = 86_400_000;
const TWO_DIGITS = 2;
const NOON_HOUR = 12;
const WEEKDAYS_PER_WEEK = 7;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function padToTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

function formatCalendarDay(day: Date): string {
  return `${String(day.getUTCFullYear())}-${padToTwoDigits(day.getUTCMonth() + 1)}-${padToTwoDigits(day.getUTCDate())}`;
}

/** El mediodía UTC de una fecha `YYYY-MM-DD`, o `null` si no tiene ese formato. */
function parseIsoDateAtNoon(isoDate: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) return null;
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), NOON_HOUR));
}

/** Hoy como `YYYY-MM-DD` en la zona indicada (la del centro, no la del móvil). */
export function getTodayIsoDate(now: Date, timeZone: string): string {
  const { year, month, day } = getZonedDateParts(now, timeZone);
  return `${String(year)}-${padToTwoDigits(month)}-${padToTwoDigits(day)}`;
}

/** Suma (o resta) días de calendario a una fecha `YYYY-MM-DD`; la misma fecha si no es válida. */
export function addDaysToIsoDate(isoDate: string, dayCount: number): string {
  const noon = parseIsoDateAtNoon(isoDate);
  if (noon === null) return isoDate;
  return formatCalendarDay(new Date(noon.getTime() + dayCount * MILLISECONDS_PER_DAY));
}

/** Día de la semana de una fecha `YYYY-MM-DD`: 1 = lunes … 7 = domingo; `null` si no es válida. */
export function getWeekdayOfIsoDate(isoDate: string): number | null {
  const noon = parseIsoDateAtNoon(isoDate);
  if (noon === null) return null;
  // JavaScript cuenta desde el domingo (0); el servidor, desde el lunes (1).
  const sundayFirstIndex = noon.getUTCDay();
  return sundayFirstIndex === 0 ? WEEKDAYS_PER_WEEK : sundayFirstIndex;
}
