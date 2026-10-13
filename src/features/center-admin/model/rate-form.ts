import { z } from 'zod';

import type { CreateRateRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

// Mismos límites que `CreateRateRequestDto` (docs/api/openapi.yaml).
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const MIN_SESSIONS = 1;
const MAX_SESSIONS = 200;
const MIN_VALID_DAYS = 1;
const MAX_VALID_DAYS = 730;
const MAX_PRICE_EUROS = 10_000;
const CENTS_PER_EURO = 100;
export const DEFAULT_RATE_SESSIONS_TEXT = '10';
export const DEFAULT_RATE_VALID_DAYS_TEXT = '30';

function isIntegerBetween(text: string, range: { min: number; max: number }): boolean {
  const value = Number(text);
  return text.trim() !== '' && Number.isInteger(value) && value >= range.min && value <= range.max;
}

/** Acepta «45», «45,5» y «45.50»; euros con hasta dos decimales. */
export function parsePriceInCents(priceText: string): number | null {
  const normalized = priceText.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const euros = Number(normalized);
  if (euros > MAX_PRICE_EUROS) return null;
  return Math.round(euros * CENTS_PER_EURO);
}

export const rateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, { error: () => i18n.t('centerAdmin.passes.nameInvalid') })
    .max(MAX_NAME_LENGTH, { error: () => i18n.t('centerAdmin.passes.nameInvalid') }),
  sessionsCount: z
    .string()
    .refine((text) => isIntegerBetween(text, { min: MIN_SESSIONS, max: MAX_SESSIONS }), {
      error: () => i18n.t('centerAdmin.passes.sessionsInvalid'),
    }),
  validDays: z
    .string()
    .refine((text) => isIntegerBetween(text, { min: MIN_VALID_DAYS, max: MAX_VALID_DAYS }), {
      error: () => i18n.t('centerAdmin.passes.validDaysInvalid'),
    }),
  price: z.string().refine((text) => parsePriceInCents(text) !== null, {
    error: () => i18n.t('centerAdmin.passes.priceInvalid'),
  }),
  /** Los servicios en los que vale; vacío = todos. */
  serviceIds: z.array(z.string()),
});
export type RateFormValues = z.infer<typeof rateFormSchema>;

export function buildEmptyRateForm(): RateFormValues {
  return {
    name: '',
    sessionsCount: DEFAULT_RATE_SESSIONS_TEXT,
    validDays: DEFAULT_RATE_VALID_DAYS_TEXT,
    price: '',
    serviceIds: [],
  };
}

export function mapRateFormToCreateRequest(formValues: RateFormValues): CreateRateRequestDto {
  return {
    name: formValues.name.trim(),
    sessionsCount: Number(formValues.sessionsCount),
    validDays: Number(formValues.validDays),
    priceCents: parsePriceInCents(formValues.price) ?? 0,
    serviceIds: formValues.serviceIds,
  };
}
