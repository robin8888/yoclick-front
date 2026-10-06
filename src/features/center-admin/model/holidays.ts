import { z } from 'zod';

const MAX_HOLIDAY_LABEL_LENGTH = 80;

export interface Holiday {
  date: string;
  label: string;
}

const holidayDraftSchema = z.object({
  date: z.iso.date(),
  label: z.string().trim().min(1).max(MAX_HOLIDAY_LABEL_LENGTH),
});

/** Una fecha `AAAA-MM-DD` válida, un motivo escrito y que ese día no esté ya cerrado. */
export function isValidHolidayDraft(draft: Holiday, existing: readonly Holiday[]): boolean {
  return (
    holidayDraftSchema.safeParse(draft).success &&
    !existing.some((holiday) => holiday.date === draft.date)
  );
}

/** Añade el cierre y deja la lista por fecha, como la espera la lista de cierres. */
export function buildHolidayList(existing: readonly Holiday[], draft: Holiday): Holiday[] {
  return [...existing, { date: draft.date, label: draft.label.trim() }].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
}
