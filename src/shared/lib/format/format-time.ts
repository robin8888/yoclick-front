import { getZonedDateParts, type DateInput } from './zoned-date-parts';

const TWO_DIGITS = 2;

function padToTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

/** «18:00»: reloj de 24 h, sin AM/PM, en la zona horaria del centro. */
export function formatTime24h(dateInput: DateInput, timeZone?: string): string {
  const { hour, minute } = getZonedDateParts(dateInput, timeZone);
  return `${padToTwoDigits(hour)}:${padToTwoDigits(minute)}`;
}
