const MONTH_ID_PATTERN = /^(\d{4})-(\d{2})$/;
const MONTH_ID_LENGTH = 7;
const MONTHS_PER_YEAR = 12;
const TWO_DIGITS = 2;
const FIRST_DAY_OF_MONTH = 1;
const NOON_HOUR = 12;

function toTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

/** El mes de una fecha `YYYY-MM-DD` como `YYYY-MM`. */
export function getMonthIdOfDate(isoDate: string): string {
  return isoDate.slice(0, MONTH_ID_LENGTH);
}

/** Suma (o resta) meses a un `YYYY-MM`; el mismo valor si no es válido. */
export function shiftMonthId(monthId: string, monthCount: number): string {
  const match = MONTH_ID_PATTERN.exec(monthId);
  if (match === null) return monthId;
  const zeroBasedIndex = Number(match[1]) * MONTHS_PER_YEAR + (Number(match[2]) - 1) + monthCount;
  const year = Math.floor(zeroBasedIndex / MONTHS_PER_YEAR);
  const month = (zeroBasedIndex % MONTHS_PER_YEAR) + 1;
  return `${String(year)}-${toTwoDigits(month)}`;
}

/** «Octubre de 2026»: el título del mes, con la inicial en mayúscula. */
export function formatMonthTitle(monthId: string): string {
  const match = MONTH_ID_PATTERN.exec(monthId);
  if (match === null) return monthId;
  const noon = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, FIRST_DAY_OF_MONTH, NOON_HOUR),
  );
  const title = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(noon);
  return `${title.charAt(0).toUpperCase()}${title.slice(1)}`;
}
