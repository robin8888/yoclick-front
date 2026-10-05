import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

const WEEKDAY_ABBREVIATIONS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const WEEKDAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;
const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;
const MILLISECONDS_PER_DAY = 86_400_000;
const TWO_DIGITS = 2;
const NOON_HOUR = 12;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface BookableDate {
  /** `YYYY-MM-DD` en la zona del centro: es lo que pide la API. */
  readonly isoDate: string;
  readonly weekdayLabel: string;
  readonly dayLabel: string;
  /** «jueves 1 de octubre», para el lector de pantalla. */
  readonly spokenLabel: string;
}

function padToTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

function describeCalendarDay(day: Date): BookableDate {
  const weekdayIndex = day.getUTCDay();
  const monthIndex = day.getUTCMonth();
  const dayOfMonth = day.getUTCDate();
  return {
    isoDate: `${String(day.getUTCFullYear())}-${padToTwoDigits(monthIndex + 1)}-${padToTwoDigits(dayOfMonth)}`,
    weekdayLabel: WEEKDAY_ABBREVIATIONS[weekdayIndex] ?? '',
    dayLabel: String(dayOfMonth),
    spokenLabel: `${WEEKDAY_NAMES[weekdayIndex] ?? ''} ${String(dayOfMonth)} de ${MONTH_NAMES[monthIndex] ?? ''}`,
  };
}

/** Etiquetas de un día de calendario `YYYY-MM-DD` (no depende de ninguna zona horaria). */
export function describeIsoDate(isoDate: string): BookableDate | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) return null;
  const [, year, month, day] = match;
  return describeCalendarDay(
    new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), NOON_HOUR)),
  );
}

interface DateListRequest {
  now: Date;
  dayCount: number;
  timeZone: string;
}

/**
 * Los próximos `dayCount` días desde hoy en la zona del centro. Se avanza de 24 h en 24 h desde
 * mediodía de hoy: así un cambio de hora (23 o 25 h) nunca salta ni repite un día.
 */
export function listBookableDates({ now, dayCount, timeZone }: DateListRequest): BookableDate[] {
  const today = getZonedDateParts(now, timeZone);
  const todayAtNoonUtc = Date.UTC(today.year, today.month - 1, today.day, NOON_HOUR);
  return Array.from({ length: dayCount }, (_unused, dayOffset) =>
    describeCalendarDay(new Date(todayAtNoonUtc + dayOffset * MILLISECONDS_PER_DAY)),
  );
}
