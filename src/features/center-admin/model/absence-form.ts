import { z } from 'zod';

import type { AddStaffAbsenceRequestDto } from '@/shared/api/generated/model';

export const ABSENCE_REASONS = ['vacation', 'training', 'personal', 'other'] as const;
export type AbsenceReason = (typeof ABSENCE_REASONS)[number];

const MAX_ABSENCE_DAYS = 366;
const MILLISECONDS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface AbsenceDraft {
  startsOn: string;
  endsOn: string;
  reason: AbsenceReason;
}

const absenceDraftSchema = z
  .object({ startsOn: z.iso.date(), endsOn: z.iso.date(), reason: z.enum(ABSENCE_REASONS) })
  .refine(({ startsOn, endsOn }) => startsOn <= endsOn)
  .refine(
    ({ startsOn, endsOn }) =>
      (Date.parse(endsOn) - Date.parse(startsOn)) / MILLISECONDS_PER_DAY < MAX_ABSENCE_DAYS,
  );

/** Dos fechas `AAAA-MM-DD` válidas, la primera no posterior a la segunda, y no más de un año. */
export function isValidAbsenceDraft(draft: AbsenceDraft): boolean {
  return absenceDraftSchema.safeParse(draft).success;
}

/** Quien escribe un solo día suele dejar «hasta» vacío: la ausencia dura ese día. */
export function buildAbsenceRequest(draft: AbsenceDraft): AddStaffAbsenceRequestDto {
  const startsOn = draft.startsOn.trim();
  const endsOn = draft.endsOn.trim() === '' ? startsOn : draft.endsOn.trim();
  return { startsOn, endsOn, reason: draft.reason };
}

/** Un día se escribe bien (`2026-11-23`) antes de comprobar nada más: sirve para avisar sin gritar. */
export function looksLikeIsoDate(text: string): boolean {
  return ISO_DATE_PATTERN.test(text.trim());
}
