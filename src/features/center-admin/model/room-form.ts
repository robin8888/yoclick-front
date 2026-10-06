import { z } from 'zod';

import type { CreateRoomRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

// Mismos límites que `CreateRoomRequestDto` (docs/api/openapi.yaml).
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 80;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 500;
export const DEFAULT_ROOM_CAPACITY_TEXT = '10';

export const roomFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, { error: () => i18n.t('centerAdmin.rooms.nameRequired') })
    .max(MAX_NAME_LENGTH, { error: () => i18n.t('centerAdmin.rooms.nameTooLong') }),
  capacity: z
    .string()
    .trim()
    .refine(
      (text) => {
        const capacity = Number(text);
        return Number.isInteger(capacity) && capacity >= MIN_CAPACITY && capacity <= MAX_CAPACITY;
      },
      { error: () => i18n.t('centerAdmin.rooms.capacityInvalid') },
    ),
});
export type RoomFormValues = z.infer<typeof roomFormSchema>;

export function buildEmptyRoomForm(): RoomFormValues {
  return { name: '', capacity: DEFAULT_ROOM_CAPACITY_TEXT };
}

export function mapRoomFormToCreateRequest(formValues: RoomFormValues): CreateRoomRequestDto {
  return { name: formValues.name.trim(), capacity: Number(formValues.capacity) };
}
