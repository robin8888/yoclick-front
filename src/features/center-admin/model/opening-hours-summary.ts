import type { CenterSettingsResponseDtoOpeningHours } from '@/shared/api/generated/model';

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export interface OpeningHoursRow {
  day: WeekDay;
  /** «07:00–14:00 y 16:00–21:00»; `null` si ese día el centro está cerrado. */
  rangesLabel: string | null;
}

/** Una fila por día de la semana, en orden de lunes a domingo. */
export function summarizeOpeningHours(
  openingHours: CenterSettingsResponseDtoOpeningHours,
): readonly OpeningHoursRow[] {
  return WEEK_DAYS.map((day) => {
    const ranges = openingHours?.[day] ?? [];
    if (ranges.length === 0) return { day, rangesLabel: null };
    const rangesLabel = ranges.map(({ opensAt, closesAt }) => `${opensAt}–${closesAt}`).join(' y ');
    return { day, rangesLabel };
  });
}
