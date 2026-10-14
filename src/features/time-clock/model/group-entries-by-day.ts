import type { TimeEntryResponseDto } from '@/shared/api/generated/model';

export interface WorkDay {
  /** `YYYY-MM-DD`, en la zona del centro. */
  workDate: string;
  entries: TimeEntryResponseDto[];
  workedMinutes: number;
}

/** Reparte los fichajes por día (el más reciente primero) y suma lo trabajado cada día. */
export function groupEntriesByDay(entries: readonly TimeEntryResponseDto[]): WorkDay[] {
  const days = new Map<string, WorkDay>();
  for (const entry of entries) {
    const day = days.get(entry.workDate) ?? {
      workDate: entry.workDate,
      entries: [],
      workedMinutes: 0,
    };
    day.entries.push(entry);
    day.workedMinutes += entry.workedMinutes;
    days.set(entry.workDate, day);
  }
  return [...days.values()]
    .map((day) => ({
      ...day,
      entries: [...day.entries].sort((first, second) =>
        first.clockInAt.localeCompare(second.clockInAt),
      ),
    }))
    .sort((first, second) => second.workDate.localeCompare(first.workDate));
}
