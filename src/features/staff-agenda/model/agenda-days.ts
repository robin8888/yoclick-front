import { shiftIsoDate } from './agenda-date';

const WEEKDAY_SHORT_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const WEEKDAY_FULL_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;
const MONTH_FULL_NAMES = [
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
const DEFAULT_VISIBLE_DAY_COUNT = 14;
const NOON_HOUR = 12;

export interface AgendaDayOption {
  isoDate: string;
  /** «Mar». */
  weekdayLabel: string;
  /** «29». */
  dayLabel: string;
  /** «martes 29 de septiembre»: lo que lee el lector de pantalla. */
  fullLabel: string;
}

function describeDay(isoDate: string): AgendaDayOption | null {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  // Mediodía UTC: el día de la semana no cambia con la zona horaria del móvil.
  const weekdayIndex = new Date(Date.UTC(year, month - 1, day, NOON_HOUR)).getUTCDay();
  const shortName = WEEKDAY_SHORT_NAMES[weekdayIndex] ?? '';
  return {
    isoDate,
    weekdayLabel: `${shortName.charAt(0).toUpperCase()}${shortName.slice(1)}`,
    dayLabel: String(day),
    fullLabel: `${WEEKDAY_FULL_NAMES[weekdayIndex] ?? ''} ${String(day)} de ${MONTH_FULL_NAMES[month - 1] ?? ''}`,
  };
}

/** Los días que se pueden elegir en la franja de la agenda: desde hoy, dos semanas. */
export function buildAgendaDays(
  todayIsoDate: string,
  dayCount: number = DEFAULT_VISIBLE_DAY_COUNT,
): AgendaDayOption[] {
  return Array.from({ length: dayCount }, (_unused, offset) => shiftIsoDate(todayIsoDate, offset))
    .map((isoDate) => (isoDate === null ? null : describeDay(isoDate)))
    .filter((option): option is AgendaDayOption => option !== null);
}

/** «martes, 29 de septiembre»: la fecha larga de la cabecera. */
export function describeDayLong(isoDate: string): string {
  const option = describeDay(isoDate);
  return option === null ? '' : option.fullLabel;
}
