import { addDaysToIsoDate, getWeekdayOfIsoDate } from '@/shared/lib/format';

import type { ScheduleSeries } from './schedule-summary';

const DAYS_TO_SUNDAY = 6;
const DAYS_PER_WEEK = 7;

/** El lunes de la semana de esa fecha (`AAAA-MM-DD`); la misma fecha si no es válida. */
export function getWeekStart(isoDate: string): string {
  const weekday = getWeekdayOfIsoDate(isoDate);
  return weekday === null ? isoDate : addDaysToIsoDate(isoDate, -(weekday - 1));
}

/** El domingo de la semana que empieza ese lunes. */
export function getWeekEnd(weekStart: string): string {
  return addDaysToIsoDate(weekStart, DAYS_TO_SUNDAY);
}

/** El domingo de la semana número `weekCount` (1 = la de esa fecha) contando desde la de `isoDate`. */
export function getEndOfWeeks(isoDate: string, weekCount: number): string {
  return addDaysToIsoDate(getWeekEnd(getWeekStart(isoDate)), (weekCount - 1) * DAYS_PER_WEEK);
}

/** El lunes de la semana de antes (`-1`) o de la de después (`1`). */
export function shiftWeek(weekStart: string, direction: 1 | -1): string {
  return addDaysToIsoDate(weekStart, direction * DAYS_PER_WEEK);
}

/** Los horarios activos que ocurren en algún día de esa semana (los que se repiten y los de esa semana). */
export function listSeriesOfWeek(
  seriesList: readonly ScheduleSeries[],
  weekStart: string,
): ScheduleSeries[] {
  const weekEnd = getWeekEnd(weekStart);
  return seriesList.filter(
    (series) =>
      series.status === 'active' &&
      series.startsOn <= weekEnd &&
      (series.endsOn === null || series.endsOn >= weekStart),
  );
}

/**
 * «Configurados para esa semana»: empiezan y terminan dentro de ella. Son los que se pueden copiar
 * a la semana siguiente; los que se repiten sin fin ya valen para todas las semanas.
 */
export function listSeriesBoundToWeek(
  seriesList: readonly ScheduleSeries[],
  weekStart: string,
): ScheduleSeries[] {
  const weekEnd = getWeekEnd(weekStart);
  return seriesList.filter(
    (series) =>
      series.status === 'active' &&
      series.startsOn >= weekStart &&
      series.endsOn !== null &&
      series.endsOn <= weekEnd,
  );
}
