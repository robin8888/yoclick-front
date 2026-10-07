const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SPANISH_DATE_PATTERN = /^(\d{1,2})[/\-. ](\d{1,2})[/\-. ](\d{2}|\d{4})$/;
const TWO_DIGIT_YEAR_BASE = 2000;
const YEAR_DIGITS = 4;
const DAY_OR_MONTH_DIGITS = 2;

/** Una fecha existe si el calendario no la «corrige» (el 31 de abril pasaría al 1 de mayo). */
function isExistingDate(year: number, month: number, day: number): boolean {
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

/** «2026-11-23» → «23/11/2026», como se escribe en España. Un texto que no sea una fecha ISO se devuelve igual. */
export function formatNumericDate(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) return isoDate;
  const [, year = '', month = '', day = ''] = match;
  return `${day}/${month}/${year}`;
}

/**
 * «23/11/2026», «23-11-26» o «23.11.2026» → «2026-11-23». `null` si no es una fecha que exista
 * (el 30 de febrero, el mes 13…). Un año de dos cifras es del siglo XXI.
 */
export function parseNumericDate(text: string): string | null {
  const match = SPANISH_DATE_PATTERN.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = match[3] ?? '';
  const year =
    rawYear.length === DAY_OR_MONTH_DIGITS
      ? TWO_DIGIT_YEAR_BASE + Number(rawYear)
      : Number(rawYear);
  if (!isExistingDate(year, month, day)) return null;
  return `${pad(year, YEAR_DIGITS)}-${pad(month, DAY_OR_MONTH_DIGITS)}-${pad(day, DAY_OR_MONTH_DIGITS)}`;
}
