import { z } from 'zod';

import { addressValueSchema, type AddressValue } from '@/features/address';
import type {
  CenterSettingsResponseDto,
  UpdateCenterSettingsRequestDto,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

const MAX_TEXT_LENGTH = 200;
const TAX_ID_PATTERN = /^[A-Za-z0-9]{9}$/;
const PHONE_PATTERN = /^\+?\d[\d -]{5,19}$/;

/** Península y Baleares, Canarias, y Colombia. */
export const CENTER_TIME_ZONES = ['Europe/Madrid', 'Atlantic/Canary', 'America/Bogota'] as const;

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
  'peluqueria',
  'estetica',
  'fisioterapia',
  'psicologia',
  'otro',
] as const;

const optionalText = z.string().trim().max(MAX_TEXT_LENGTH);

const optionalAddress = addressValueSchema.extend({ text: optionalText });

/** Un campo opcional: vacío vale; si se escribe, ha de cumplir el formato. */
function optionalWithFormat(pattern: RegExp, getMessage: () => string) {
  return optionalText.refine((text) => text === '' || pattern.test(text), { error: getMessage });
}

export const centerDetailsFormSchema = z.object({
  sectorId: z.enum(SECTOR_CHOICE_IDS),
  timezone: z.enum(CENTER_TIME_ZONES),
  address: optionalAddress,
  phone: optionalWithFormat(PHONE_PATTERN, () => i18n.t('centerAdmin.details.phoneInvalid')),
  contactEmail: optionalText.refine((text) => text === '' || z.email().safeParse(text).success, {
    error: () => i18n.t('centerAdmin.details.emailInvalid'),
  }),
  legalName: optionalText,
  taxId: optionalWithFormat(TAX_ID_PATTERN, () => i18n.t('centerAdmin.details.taxIdInvalid')),
  taxAddress: optionalAddress,
});
export type CenterDetailsFormValues = z.infer<typeof centerDetailsFormSchema>;

function isKnownSector(sectorId: string): sectorId is CenterDetailsFormValues['sectorId'] {
  return (SECTOR_CHOICE_IDS as readonly string[]).includes(sectorId);
}

function isKnownTimeZone(timezone: string): timezone is CenterDetailsFormValues['timezone'] {
  return (CENTER_TIME_ZONES as readonly string[]).includes(timezone);
}

function buildTextOnlyAddress(text: string): AddressValue {
  return { text, latitude: null, longitude: null };
}

export function mapSettingsToDetailsForm(
  settings: CenterSettingsResponseDto,
): CenterDetailsFormValues {
  return {
    sectorId: isKnownSector(settings.sectorId) ? settings.sectorId : 'otro',
    timezone: isKnownTimeZone(settings.timezone) ? settings.timezone : 'Europe/Madrid',
    address: {
      text: settings.address ?? '',
      latitude: settings.latitude,
      longitude: settings.longitude,
    },
    phone: settings.phone ?? '',
    contactEmail: settings.contactEmail ?? '',
    legalName: settings.legalName ?? '',
    taxId: settings.taxId ?? '',
    // La dirección fiscal es solo texto: no se usa para ubicar el centro en el mapa.
    taxAddress: buildTextOnlyAddress(settings.taxAddress ?? ''),
  };
}

const emptyToNull = (text: string): string | null => (text.trim() === '' ? null : text.trim());

function buildCoordinatesPatch(
  address: AddressValue,
): Pick<UpdateCenterSettingsRequestDto, 'latitude' | 'longitude'> {
  const hasText = address.text.trim() !== '';
  return {
    latitude: hasText ? address.latitude : null,
    longitude: hasText ? address.longitude : null,
  };
}

/** Lo escrito en blanco borra el dato (`null`); el resto se envía tal cual. */
export function buildDetailsPatch(values: CenterDetailsFormValues): UpdateCenterSettingsRequestDto {
  return {
    sectorId: values.sectorId,
    timezone: values.timezone,
    address: emptyToNull(values.address.text),
    // Sin sugerencia elegida las coordenadas se borran: las de antes ya no corresponden al texto.
    ...buildCoordinatesPatch(values.address),
    phone: emptyToNull(values.phone),
    contactEmail: emptyToNull(values.contactEmail),
    legalName: emptyToNull(values.legalName),
    taxId: emptyToNull(values.taxId),
    taxAddress: emptyToNull(values.taxAddress.text),
  };
}
