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
    latitude: null,
    longitude: null,
    ...overrides,
  } as CenterSettingsResponseDto;
}

const VALID_FORM = {
  sectorId: 'yoga',
  timezone: 'Atlantic/Canary',
  address: { text: 'Calle Mayor 1', latitude: 28.1, longitude: -15.4 },
  phone: '+34 600 123 456',
  contactEmail: 'hola@centro.es',
  legalName: 'Centro S.L.',
  taxId: 'B12345678',
  taxAddress: { text: 'Calle Fiscal 2', latitude: null, longitude: null },
} as const;

describe('mapSettingsToDetailsForm', () => {
  it('turns missing data into empty text and keeps the known sector', () => {
    expect(mapSettingsToDetailsForm(buildSettings())).toMatchObject({
      sectorId: 'marciales',
      address: { text: '', latitude: null, longitude: null },
      taxId: '',
    });
  });

  it('brings the saved coordinates of the center into the address', () => {
    const settings = buildSettings({ address: 'Calle Mayor 1', latitude: 40.4, longitude: -3.7 });

    expect(mapSettingsToDetailsForm(settings).address).toEqual({
      text: 'Calle Mayor 1',
      latitude: 40.4,
      longitude: -3.7,
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

  it('sends the coordinates of the chosen address together with its text', () => {
    expect(buildDetailsPatch(VALID_FORM)).toMatchObject({
      address: 'Calle Mayor 1',
      latitude: 28.1,
      longitude: -15.4,
    });
  });

  it('clears the coordinates when the address was typed by hand', () => {
    const typedByHand = {
      ...VALID_FORM,
      address: { text: 'Calle Nueva 5', latitude: null, longitude: null },
    };

    expect(buildDetailsPatch(typedByHand)).toMatchObject({
      address: 'Calle Nueva 5',
      latitude: null,
      longitude: null,
    });
  });

  it('clears the address and its coordinates when the field is left blank', () => {
    const blank = { ...VALID_FORM, address: { text: ' ', latitude: 28.1, longitude: -15.4 } };

    expect(buildDetailsPatch(blank)).toMatchObject({
      address: null,
      latitude: null,
      longitude: null,
    });
  });

  it('keeps the fiscal address as text only', () => {
    expect(buildDetailsPatch(VALID_FORM)).toMatchObject({ taxAddress: 'Calle Fiscal 2' });
  });
});
