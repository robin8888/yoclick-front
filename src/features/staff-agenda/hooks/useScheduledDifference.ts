import { shiftIsoDate } from '../model/agenda-date';
import { countScheduledEntries, formatSignedDifference } from '../model/center-agenda-summary';
import { useDayAgenda } from './useDayAgenda';

const DAYS_PER_WEEK = 7;

/** «+4» o «-2» frente al mismo día de la semana anterior; `null` mientras esa agenda carga. */
export function useScheduledDifference(isoDate: string, scheduledCount: number): string | null {
  const lastWeekAgenda = useDayAgenda(shiftIsoDate(isoDate, -DAYS_PER_WEEK) ?? isoDate);
  if (lastWeekAgenda.data === undefined) return null;

  return formatSignedDifference(scheduledCount, countScheduledEntries(lastWeekAgenda.data.entries));
}
