import type { CenterSettingsResponseDtoOpeningHours } from '@/shared/api/generated/model';

import { WEEK_DAYS, type WeekDay } from './opening-hours-summary';

export interface TimeRange {
  opensAt: string;
  closesAt: string;
}

export type OpeningHoursDraft = Record<WeekDay, TimeRange[]>;
export type TimeField = keyof TimeRange;

export const MAX_RANGES_PER_DAY = 4;
export const TIME_STEP_MINUTES = 30;
const MINUTES_PER_HOUR = 60;
const LAST_HOUR_OF_DAY = 23;
const LAST_STEP_MINUTES = 30;
// El servidor solo admite horas de 00:00 a 23:59: «cerrar a medianoche» se escribe 23:30 o 23:59.
const LAST_MINUTE_OF_DAY = LAST_HOUR_OF_DAY * MINUTES_PER_HOUR + LAST_STEP_MINUTES;
const TIME_PART_LENGTH = 2;
const NEW_RANGE_LENGTH_HOURS = 4;
const DEFAULT_RANGE: TimeRange = { opensAt: '09:00', closesAt: '14:00' };
const DEFAULT_NEW_RANGE_LENGTH_MINUTES = NEW_RANGE_LENGTH_HOURS * MINUTES_PER_HOUR;

export function timeToMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return `${String(hours).padStart(TIME_PART_LENGTH, '0')}:${String(minutes).padStart(TIME_PART_LENGTH, '0')}`;
}

/** El horario guardado como borrador editable: un día sin tramos está cerrado. */
export function buildOpeningHoursDraft(
  openingHours: CenterSettingsResponseDtoOpeningHours,
): OpeningHoursDraft {
  const entries = WEEK_DAYS.map((day) => [
    day,
    (openingHours?.[day] ?? []).map(({ opensAt, closesAt }) => ({ opensAt, closesAt })),
  ]);
  return Object.fromEntries(entries) as OpeningHoursDraft;
}

export function setDayOpen(
  draft: OpeningHoursDraft,
  day: WeekDay,
  isOpen: boolean,
): OpeningHoursDraft {
  return { ...draft, [day]: isOpen ? [{ ...DEFAULT_RANGE }] : [] };
}

/** Un tramo nuevo justo después del último (por ejemplo, la tarde tras la mañana). */
export function addRangeToDay(draft: OpeningHoursDraft, day: WeekDay): OpeningHoursDraft {
  const ranges = draft[day];
  const lastClosesAt = ranges.at(-1)?.closesAt;
  if (ranges.length >= MAX_RANGES_PER_DAY || lastClosesAt === undefined) return draft;
  const opensAt = Math.min(timeToMinutes(lastClosesAt) + TIME_STEP_MINUTES, LAST_MINUTE_OF_DAY);
  const closesAt = Math.min(opensAt + DEFAULT_NEW_RANGE_LENGTH_MINUTES, LAST_MINUTE_OF_DAY);
  return {
    ...draft,
    [day]: [...ranges, { opensAt: minutesToTime(opensAt), closesAt: minutesToTime(closesAt) }],
  };
}

export function removeRangeFromDay(
  draft: OpeningHoursDraft,
  day: WeekDay,
  rangeIndex: number,
): OpeningHoursDraft {
  return { ...draft, [day]: draft[day].filter((_range, index) => index !== rangeIndex) };
}

interface TimeStepRequest {
  draft: OpeningHoursDraft;
  day: WeekDay;
  rangeIndex: number;
  field: TimeField;
  /** `1` suma un paso de 30 minutos y `-1` lo resta. */
  direction: 1 | -1;
}

export function stepRangeTime({
  draft,
  day,
  rangeIndex,
  field,
  direction,
}: TimeStepRequest): OpeningHoursDraft {
  const ranges = draft[day].map((range, index) => {
    if (index !== rangeIndex) return range;
    const steppedMinutes = timeToMinutes(range[field]) + direction * TIME_STEP_MINUTES;
    const clampedMinutes = Math.min(Math.max(steppedMinutes, 0), LAST_MINUTE_OF_DAY);
    return { ...range, [field]: minutesToTime(clampedMinutes) };
  });
  return { ...draft, [day]: ranges };
}

/** Los días con tramos que abren después de cerrar o que se pisan entre sí. */
export function findDaysWithProblems(draft: OpeningHoursDraft): WeekDay[] {
  return WEEK_DAYS.filter((day) => {
    const sortedRanges = [...draft[day]].sort(
      (first, second) => timeToMinutes(first.opensAt) - timeToMinutes(second.opensAt),
    );
    return sortedRanges.some(
      (range, index) =>
        timeToMinutes(range.opensAt) >= timeToMinutes(range.closesAt) ||
        timeToMinutes(range.opensAt) <
          timeToMinutes(sortedRanges[index - 1]?.closesAt ?? range.opensAt),
    );
  });
}

export function isOpeningHoursChanged(
  draft: OpeningHoursDraft,
  published: OpeningHoursDraft,
): boolean {
  return JSON.stringify(draft) !== JSON.stringify(published);
}
