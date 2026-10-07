import { i18n } from './i18n';

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
const WEEKDAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
const YEAR_LENGTH = 4;
const DAY_NUMBER_START = 8;
const MONTH_NUMBER_START = 5;
const MONTH_NUMBER_END = 7;

export interface CalendarMonth {
  year: number;
  /** 1–12. */
  month: number;
}

/** «23 de noviembre de 2026» para el lector de pantalla. */
function describeIsoDate(isoDate: string): string {
  const year = isoDate.slice(0, YEAR_LENGTH);
  const monthName =
    MONTH_NAMES[Number(isoDate.slice(MONTH_NUMBER_START, MONTH_NUMBER_END)) - 1] ?? '';
  return `${String(Number(isoDate.slice(DAY_NUMBER_START)))} de ${monthName} de ${year}`;
}

/** Los textos del calendario de un mes, en español de España. */
export function buildCalendarLabels(visibleMonth: CalendarMonth): {
  monthTitle: string;
  previousMonth: string;
  nextMonth: string;
  weekdayInitials: readonly string[];
  describeDay: (isoDate: string) => string;
} {
  return {
    monthTitle: `${MONTH_NAMES[visibleMonth.month - 1] ?? ''} de ${String(visibleMonth.year)}`,
    previousMonth: i18n.t('calendar.previousMonth'),
    nextMonth: i18n.t('calendar.nextMonth'),
    weekdayInitials: WEEKDAY_INITIALS,
    describeDay: describeIsoDate,
  };
}
