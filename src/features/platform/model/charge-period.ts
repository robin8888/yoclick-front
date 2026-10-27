import { getTodayIsoDate } from '@/shared/lib/format';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';
const MONTHS_PER_YEAR = 12;
const MONTHS_PER_QUARTER = 3;
const MONTH_KEY_LENGTH = 7;
const MONTH_DIGITS = 2;
const YEAR_DIGITS = 4;

export type ReportPeriodKind = 'month' | 'quarter';

export interface MonthRange {
  fromMonth: string;
  toMonth: string;
}

function toMonthIndex(monthKey: string): number {
  const [year = 0, month = 1] = monthKey.split('-').map(Number);
  return year * MONTHS_PER_YEAR + month - 1;
}

function fromMonthIndex(monthIndex: number): string {
  const year = Math.floor(monthIndex / MONTHS_PER_YEAR);
  const month = (monthIndex % MONTHS_PER_YEAR) + 1;
  return `${String(year).padStart(YEAR_DIGITS, '0')}-${String(month).padStart(MONTH_DIGITS, '0')}`;
}

/** El mes natural de hoy (`YYYY-MM`) en la hora de Madrid, que es la del gestor. */
export function getCurrentMonthKey(now: Date): string {
  return getTodayIsoDate(now, PLATFORM_TIME_ZONE).slice(0, MONTH_KEY_LENGTH);
}

export function shiftMonth(monthKey: string, monthCount: number): string {
  return fromMonthIndex(toMonthIndex(monthKey) + monthCount);
}

/** Los tres meses del trimestre natural al que pertenece el mes dado (T1 = enero a marzo). */
export function getQuarterRange(monthKey: string): MonthRange {
  const monthIndex = toMonthIndex(monthKey);
  const firstMonthIndex = monthIndex - (monthIndex % MONTHS_PER_QUARTER);
  return {
    fromMonth: fromMonthIndex(firstMonthIndex),
    toMonth: fromMonthIndex(firstMonthIndex + MONTHS_PER_QUARTER - 1),
  };
}

export function getPeriodRange(kind: ReportPeriodKind, monthKey: string): MonthRange {
  return kind === 'month' ? { fromMonth: monthKey, toMonth: monthKey } : getQuarterRange(monthKey);
}

/** Pasar al periodo anterior (−1) o al siguiente (+1): un mes o un trimestre entero. */
export function shiftPeriod(kind: ReportPeriodKind, monthKey: string, direction: -1 | 1): string {
  return shiftMonth(monthKey, direction * (kind === 'month' ? 1 : MONTHS_PER_QUARTER));
}

/** «octubre de 2026». */
export function formatMonthLabel(monthKey: string): string {
  const [year = 0, month = 1] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** «4.º trimestre de 2026». */
export function formatQuarterLabel(monthKey: string): string {
  const { fromMonth } = getQuarterRange(monthKey);
  const [year = 0, month = 1] = fromMonth.split('-').map(Number);
  const quarterNumber = Math.floor((month - 1) / MONTHS_PER_QUARTER) + 1;
  return `${String(quarterNumber)}.º trimestre de ${String(year)}`;
}

export function formatPeriodLabel(kind: ReportPeriodKind, monthKey: string): string {
  return kind === 'month' ? formatMonthLabel(monthKey) : formatQuarterLabel(monthKey);
}

/** Un periodo futuro todavía no tiene cobros: no se ofrece avanzar más allá del actual. */
export function canShiftToNextPeriod(
  kind: ReportPeriodKind,
  monthKey: string,
  currentMonthKey: string,
): boolean {
  return getPeriodRange(kind, monthKey).toMonth < currentMonthKey;
}
