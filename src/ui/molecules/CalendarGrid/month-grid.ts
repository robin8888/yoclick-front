const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;
const YEAR_DIGITS = 4;
const TWO_DIGITS = 2;

export interface MonthRef {
  year: number;
  /** 1–12. */
  month: number;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${pad(year, YEAR_DIGITS)}-${pad(month, TWO_DIGITS)}-${pad(day, TWO_DIGITS)}`;
}

export function readMonthOfIsoDate(isoDate: string): MonthRef | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(isoDate);
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

export function addMonths(reference: MonthRef, delta: number): MonthRef {
  const index = reference.year * MONTHS_PER_YEAR + (reference.month - 1) + delta;
  return { year: Math.floor(index / MONTHS_PER_YEAR), month: (index % MONTHS_PER_YEAR) + 1 };
}

/**
 * Las semanas del mes empezando en lunes: cada celda es la fecha ISO o `null` si el hueco es de
 * otro mes. Siempre filas completas de siete.
 */
export function buildMonthWeeks({ year, month }: MonthRef): (string | null)[][] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leadingBlanks = (firstWeekday + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const dayCount = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: dayCount }, (_unused, index) => toIsoDate(year, month, index + 1)),
  ];
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);
  return Array.from({ length: cells.length / DAYS_PER_WEEK }, (_unused, week) =>
    cells.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  );
}
