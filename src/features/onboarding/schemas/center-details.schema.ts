import { z } from 'zod';

import { i18n } from '@/shared/i18n';
import { SECTOR_IDS } from '@/shared/i18n/sector-vocabulary';

// Mismos límites que `CreateCenterRequestDto` (docs/api/openapi.yaml).
const MIN_CENTER_NAME_LENGTH = 2;
const MAX_CENTER_NAME_LENGTH = 80;
const MAX_CITY_LENGTH = 80;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const centerDetailsFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_CENTER_NAME_LENGTH, { error: () => i18n.t('validation.centerNameRequired') })
    .max(MAX_CENTER_NAME_LENGTH, { error: () => i18n.t('validation.centerNameTooLong') }),
  sectorId: z.enum(SECTOR_IDS, { error: () => i18n.t('validation.sectorRequired') }),
  city: z
    .string()
    .trim()
    .max(MAX_CITY_LENGTH, { error: () => i18n.t('validation.cityTooLong') }),
  brandColor: z.string().regex(HEX_COLOR_PATTERN),
  isListed: z.boolean(),
});
export type CenterDetailsFormValues = z.infer<typeof centerDetailsFormSchema>;
