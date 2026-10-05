import { getZonedDateParts, type DateInput } from '@/shared/lib/format/zoned-date-parts';

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
const MS_PER_MINUTE = 60_000;

/** «martes, 29 de septiembre» en la zona del centro. */
export function formatLongDate(dateInput: DateInput, timeZone?: string): string {
  const { weekdayIndex, day, month } = getZonedDateParts(dateInput, timeZone);
  return `${WEEKDAY_NAMES[weekdayIndex] ?? ''}, ${String(day)} de ${MONTH_NAMES[month - 1] ?? ''}`;
}

export function extractFirstName(fullName: string | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? '';
}

export function calculateDurationInMinutes(startsAtIso: string, endsAtIso: string): number {
  return Math.round((Date.parse(endsAtIso) - Date.parse(startsAtIso)) / MS_PER_MINUTE);
}
