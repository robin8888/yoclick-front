import {
  formatCenterCity,
  mapBrandingToPendingCenter,
  mapPublicCenterToPendingCenter,
  mapSearchResultToPendingCenter,
} from './pending-center';

const NORTE_CENTER = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Studio Norte',
  slug: 'studio-norte',
  sectorId: 'estudio',
  brandColor: '#E4572E',
  logoUrl: null,
};

describe('pending center mappers', () => {
  it('keeps the join code when the center was found by code', () => {
    const pendingCenter = mapPublicCenterToPendingCenter({ ...NORTE_CENTER, city: null }, 'NORTE7');

    expect(pendingCenter).toEqual({
      id: NORTE_CENTER.id,
      name: 'Studio Norte',
      sectorId: 'estudio',
      brandHexColor: '#E4572E',
      logoUrl: null,
      joinCode: 'NORTE7',
    });
  });

  it('has no join code when the center came from the directory search', () => {
    const pendingCenter = mapSearchResultToPendingCenter({
      ...NORTE_CENTER,
      city: 'Madrid',
      distanceInKilometers: null,
    });

    expect(pendingCenter.joinCode).toBeUndefined();
  });

  it('reads the center id from the branding response', () => {
    const pendingCenter = mapBrandingToPendingCenter(
      {
        centerId: NORTE_CENTER.id,
        name: 'Studio Norte',
        sectorId: 'estudio',
        brandColor: '#E4572E',
        logoUrl: null,
      },
      'NORTE7',
    );

    expect(pendingCenter.id).toBe(NORTE_CENTER.id);
    expect(pendingCenter.joinCode).toBe('NORTE7');
  });
});

describe('formatCenterCity', () => {
  it.each([
    ['Madrid', 'Madrid'],
    ['  ', null],
    [['Madrid'], 'Madrid'],
    [['Madrid', 'Getafe'], 'Madrid, Getafe'],
    [[], null],
    [null, null],
    [42, null],
  ])('formats %j as %j', (rawCity, expectedCity) => {
    expect(formatCenterCity(rawCity)).toBe(expectedCity);
  });
});
