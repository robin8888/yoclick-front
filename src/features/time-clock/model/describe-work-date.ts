const NOON_HOUR = 12;
const WEEKDAY_LETTERS = 3;

export interface WorkDateParts {
  /** «lun», «mar»… sin punto y en minúsculas. */
  weekday: string;
  /** «5», «14». */
  dayNumber: string;
}

/** La fecha `YYYY-MM-DD` partida en día de la semana abreviado y número, para el bloque de cada día. */
export function describeWorkDate(isoDate: string): WorkDateParts {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  const noon = new Date(Date.UTC(year, month - 1, day, NOON_HOUR));
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short', timeZone: 'UTC' })
    .format(noon)
    .replace('.', '')
    .slice(0, WEEKDAY_LETTERS)
    .toLowerCase();
  return { weekday, dayNumber: String(day) };
}
