import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';

import {
  buildDetailsPatch,
  centerDetailsFormSchema,
  mapSettingsToDetailsForm,
} from './center-details-form';

function buildSettings(
  overrides: Partial<CenterSettingsResponseDto> = {},
): CenterSettingsResponseDto {
  return {
    sectorId: 'marciales',
    timezone: 'Europe/Madrid',
    address: null,
    phone: null,
    contactEmail: null,
    legalName: null,
    taxId: null,
    taxAddress: null,
    ...overrides,
  } as CenterSettingsResponseDto;
}

const VALID_FORM = {
  sectorId: 'yoga',
  timezone: 'Atlantic/Canary',
  address: 'Calle Mayor 1',
  phone: '+34 600 123 456',
  contactEmail: 'hola@centro.es',
  legalName: 'Centro S.L.',
  taxId: 'B12345678',
  taxAddress: 'Calle Fiscal 2',
} as const;

describe('mapSettingsToDetailsForm', () => {
  it('turns missing data into empty text and keeps the known sector', () => {
    expect(mapSettingsToDetailsForm(buildSettings())).toMatchObject({
      sectorId: 'marciales',
      address: '',
      taxId: '',
    });
  });

  it('falls back to "otro" for an unknown sector', () => {
    expect(mapSettingsToDetailsForm(buildSettings({ sectorId: 'raro' })).sectorId).toBe('otro');
  });

  it('falls back to Madrid for an unknown time zone', () => {
    expect(mapSettingsToDetailsForm(buildSettings({ timezone: 'Asia/Tokyo' })).timezone).toBe(
      'Europe/Madrid',
    );
  });
});

describe('centerDetailsFormSchema', () => {
  it.each([
    ['everything valid', VALID_FORM, true],
    ['optional fields left empty', { ...VALID_FORM, phone: '', contactEmail: '', taxId: '' }, true],
    ['a tax id that is too short', { ...VALID_FORM, taxId: '12' }, false],
    ['a malformed email', { ...VALID_FORM, contactEmail: 'no-es-un-correo' }, false],
    ['a malformed phone', { ...VALID_FORM, phone: 'abc' }, false],
  ])('%s', (_label, values, isValid) => {
    expect(centerDetailsFormSchema.safeParse(values).success).toBe(isValid);
  });
});

describe('buildDetailsPatch', () => {
  it('sends blank text as null so the data is cleared', () => {
    expect(buildDetailsPatch({ ...VALID_FORM, phone: '  ', legalName: '' })).toMatchObject({
      phone: null,
      legalName: null,
      taxId: 'B12345678',
    });
  });
});
