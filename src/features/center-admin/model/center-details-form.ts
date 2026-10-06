import { z } from 'zod';

import type {
  CenterSettingsResponseDto,
  UpdateCenterSettingsRequestDto,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

const MAX_TEXT_LENGTH = 200;
const TAX_ID_PATTERN = /^[A-Za-z0-9]{9}$/;
const PHONE_PATTERN = /^\+?\d[\d -]{5,19}$/;

/** Las dos zonas del prototipo: península y Baleares, y Canarias. */
export const CENTER_TIME_ZONES = ['Europe/Madrid', 'Atlantic/Canary'] as const;

export const SECTOR_CHOICE_IDS = [
  'gym',
  'estudio',
  'readap',
  'box',
  'yoga',
  'academia',
  'baile',
  'marciales',
  'musica',
  'cocina',
  'otro',
] as const;

const optionalText = z.string().trim().max(MAX_TEXT_LENGTH);

/** Un campo opcional: vacío vale; si se escribe, ha de cumplir el formato. */
function optionalWithFormat(pattern: RegExp, getMessage: () => string) {
  return optionalText.refine((text) => text === '' || pattern.test(text), { error: getMessage });
}

export const centerDetailsFormSchema = z.object({
  sectorId: z.enum(SECTOR_CHOICE_IDS),
  timezone: z.enum(CENTER_TIME_ZONES),
  address: optionalText,
  phone: optionalWithFormat(PHONE_PATTERN, () => i18n.t('centerAdmin.details.phoneInvalid')),
  contactEmail: optionalText.refine((text) => text === '' || z.email().safeParse(text).success, {
    error: () => i18n.t('centerAdmin.details.emailInvalid'),
  }),
  legalName: optionalText,
  taxId: optionalWithFormat(TAX_ID_PATTERN, () => i18n.t('centerAdmin.details.taxIdInvalid')),
  taxAddress: optionalText,
});
export type CenterDetailsFormValues = z.infer<typeof centerDetailsFormSchema>;

function isKnownSector(sectorId: string): sectorId is CenterDetailsFormValues['sectorId'] {
  return (SECTOR_CHOICE_IDS as readonly string[]).includes(sectorId);
}

function isKnownTimeZone(timezone: string): timezone is CenterDetailsFormValues['timezone'] {
  return (CENTER_TIME_ZONES as readonly string[]).includes(timezone);
}

export function mapSettingsToDetailsForm(
  settings: CenterSettingsResponseDto,
): CenterDetailsFormValues {
  return {
    sectorId: isKnownSector(settings.sectorId) ? settings.sectorId : 'otro',
    timezone: isKnownTimeZone(settings.timezone) ? settings.timezone : 'Europe/Madrid',
    address: settings.address ?? '',
    phone: settings.phone ?? '',
    contactEmail: settings.contactEmail ?? '',
    legalName: settings.legalName ?? '',
    taxId: settings.taxId ?? '',
    taxAddress: settings.taxAddress ?? '',
  };
}

const emptyToNull = (text: string): string | null => (text.trim() === '' ? null : text.trim());

/** Lo escrito en blanco borra el dato (`null`); el resto se envía tal cual. */
export function buildDetailsPatch(values: CenterDetailsFormValues): UpdateCenterSettingsRequestDto {
  return {
    sectorId: values.sectorId,
    timezone: values.timezone,
    address: emptyToNull(values.address),
    phone: emptyToNull(values.phone),
    contactEmail: emptyToNull(values.contactEmail),
    legalName: emptyToNull(values.legalName),
    taxId: emptyToNull(values.taxId),
    taxAddress: emptyToNull(values.taxAddress),
  };
}
