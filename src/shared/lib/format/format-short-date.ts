import { getZonedDateParts, type DateInput } from './zoned-date-parts';

const WEEKDAY_ABBREVIATIONS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MONTH_ABBREVIATIONS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

/** «jue 1 oct» en la zona horaria del centro. */
export function formatShortDate(dateInput: DateInput, timeZone?: string): string {
  const { weekdayIndex, day, month } = getZonedDateParts(dateInput, timeZone);
  const weekday = WEEKDAY_ABBREVIATIONS[weekdayIndex] ?? '';
  const monthName = MONTH_ABBREVIATIONS[month - 1] ?? '';
  return `${weekday} ${String(day)} ${monthName}`;
}
