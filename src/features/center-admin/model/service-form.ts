import { z } from 'zod';

import type {
  CreateServiceRequestDto,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

const HALF_HOUR_MINUTES = 30;
const THREE_QUARTERS_MINUTES = 45;
const ONE_HOUR_MINUTES = 60;
const NINETY_MINUTES = 90;
const TWO_HOURS_MINUTES = 120;
export const DURATION_PRESETS_MINUTES = [
  HALF_HOUR_MINUTES,
  THREE_QUARTERS_MINUTES,
  ONE_HOUR_MINUTES,
  NINETY_MINUTES,
  TWO_HOURS_MINUTES,
] as const;
export const DEFAULT_SERVICE_DURATION_MINUTES = ONE_HOUR_MINUTES;

// Mismos límites que `CreateServiceRequestDto` (docs/api/openapi.yaml).
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 600;
const MAX_PRICE_CENTS = 10_000_000;
const CENTS_PER_EURO = 100;
const PRICE_DECIMAL_DIGITS = 2;
const PRICE_PATTERN = /^\d+([.,]\d{1,2})?$/;

export const serviceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, { error: () => i18n.t('centerAdmin.serviceEditor.nameRequired') })
    .max(MAX_NAME_LENGTH, { error: () => i18n.t('centerAdmin.serviceEditor.nameTooLong') }),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, {
      error: () => i18n.t('centerAdmin.serviceEditor.descriptionTooLong'),
    }),
  durationMinutes: z
    .string()
    .trim()
    .refine(
      (text) => {
        const minutes = Number(text);
        return (
          Number.isInteger(minutes) &&
          minutes >= MIN_DURATION_MINUTES &&
          minutes <= MAX_DURATION_MINUTES
        );
      },
      { error: () => i18n.t('centerAdmin.serviceEditor.durationInvalid') },
    ),
  priceInEuros: z
    .string()
    .trim()
    .refine((text) => text === '' || parsePriceInCents(text) !== null, {
      error: () => i18n.t('centerAdmin.serviceEditor.priceInvalid'),
    }),
  isVisible: z.boolean(),
  /** Quién da el servicio; vacío en un alta = quien lo crea (lo decide el servidor). */
  staffMembershipIds: z.array(z.string()),
});
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

/** «35», «35,5» o «35.50» → céntimos; `null` si no es un importe válido. */
export function parsePriceInCents(priceText: string): number | null {
  const trimmedText = priceText.trim();
  if (!PRICE_PATTERN.test(trimmedText)) return null;
  const cents = Math.round(Number(trimmedText.replace(',', '.')) * CENTS_PER_EURO);
  return cents <= MAX_PRICE_CENTS ? cents : null;
}

export function formatPriceForInput(priceCents: number | null): string {
  if (priceCents === null) return '';
  const euros = priceCents / CENTS_PER_EURO;
  return Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(PRICE_DECIMAL_DIGITS).replace('.', ',');
}

export function buildEmptyServiceForm(): ServiceFormValues {
  return {
    name: '',
    description: '',
    durationMinutes: String(DEFAULT_SERVICE_DURATION_MINUTES),
    priceInEuros: '',
    isVisible: true,
    staffMembershipIds: [],
  };
}

export function mapServiceToForm(service: ServiceListResponseDtoServicesItem): ServiceFormValues {
  return {
    name: service.name,
    description: service.description ?? '',
    durationMinutes: String(service.durationMinutes),
    priceInEuros: formatPriceForInput(service.priceCents),
    isVisible: service.isVisible,
    staffMembershipIds: service.staff.map((staffMember) => staffMember.membershipId),
  };
}

/** Enviar `null` en una edición borra la descripción o el precio; en un alta se omiten. */
export function mapFormToServiceChanges(formValues: ServiceFormValues): {
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number | null;
  isVisible: boolean;
  staffMembershipIds?: string[];
} {
  return {
    name: formValues.name,
    description: formValues.description === '' ? null : formValues.description,
    durationMinutes: Number(formValues.durationMinutes),
    priceCents: formValues.priceInEuros === '' ? null : parsePriceInCents(formValues.priceInEuros),
    isVisible: formValues.isVisible,
    ...(formValues.staffMembershipIds.length === 0
      ? {}
      : { staffMembershipIds: formValues.staffMembershipIds }),
  };
}

export function mapFormToCreateRequest(formValues: ServiceFormValues): CreateServiceRequestDto {
  const { description, priceCents, ...requiredChanges } = mapFormToServiceChanges(formValues);
  return {
    ...requiredChanges,
    ...(description === null ? {} : { description }),
    ...(priceCents === null ? {} : { priceCents }),
  };
}
