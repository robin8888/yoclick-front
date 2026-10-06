import { z } from 'zod';

import type { CreateGroupRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { CLIENT_LEVEL_IDS, type ClientLevelId } from './client-display';

// Mismos límites que `CreateGroupRequestDto` (docs/api/openapi.yaml).
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 80;
/** «Sin nivel» y «sin responsable» se eligen con un valor vacío. */
export const NO_CHOICE = '';

export const groupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, { error: () => i18n.t('clients.groupForm.nameRequired') })
    .max(MAX_NAME_LENGTH, { error: () => i18n.t('clients.groupForm.nameTooLong') }),
});
export type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupChoices {
  levelChoice: ClientLevelId | typeof NO_CHOICE;
  instructorChoice: string;
}

export function mapGroupFormToRequest(
  formValues: GroupFormValues,
  { levelChoice, instructorChoice }: GroupChoices,
): CreateGroupRequestDto {
  return {
    name: formValues.name.trim(),
    ...(levelChoice === NO_CHOICE ? {} : { level: levelChoice }),
    ...(instructorChoice === NO_CHOICE ? {} : { instructorMembershipId: instructorChoice }),
  };
}

export function isClientLevelId(value: string): value is ClientLevelId {
  return (CLIENT_LEVEL_IDS as readonly string[]).includes(value);
}
