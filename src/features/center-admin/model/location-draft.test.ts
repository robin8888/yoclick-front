import {
  buildLocationDraft,
  EMPTY_LOCATION_DRAFT,
  isLocationNameMissing,
  isSameLocationRequest,
  toLocationRequest,
} from './location-draft';

const PARK = {
  name: 'Parque del Retiro',
  address: 'Plaza de la Independencia 7, Madrid',
  latitude: 40.4153,
  longitude: -3.6844,
};

describe('toLocationRequest', () => {
  it.each([
    ['inside the center', EMPTY_LOCATION_DRAFT, null],
    ['outside without a name yet', { ...EMPTY_LOCATION_DRAFT, isOutside: true }, null],
    [
      'outside with a name only',
      { ...EMPTY_LOCATION_DRAFT, isOutside: true, name: '  Auditorio  ' },
      { name: 'Auditorio', address: null, latitude: null, longitude: null },
    ],
    ['outside with an address and its point', buildLocationDraft(PARK), PARK],
    [
      'a point that is not complete is dropped',
      {
        isOutside: true,
        name: 'Parque',
        address: { text: 'Calle Mayor', latitude: 40.4, longitude: null },
      },
      { name: 'Parque', address: 'Calle Mayor', latitude: null, longitude: null },
    ],
  ])('sends the right thing when it is %s', (_case, draft, expectedRequest) => {
    expect(toLocationRequest(draft)).toEqual(expectedRequest);
  });
});

describe('isLocationNameMissing', () => {
  it('only asks for a name when the class is outside', () => {
    expect(isLocationNameMissing(EMPTY_LOCATION_DRAFT)).toBe(false);
    expect(isLocationNameMissing({ ...EMPTY_LOCATION_DRAFT, isOutside: true })).toBe(true);
    expect(isLocationNameMissing(buildLocationDraft(PARK))).toBe(false);
  });
});

describe('isSameLocationRequest', () => {
  it('tells a changed place from the same one', () => {
    expect(isSameLocationRequest(PARK, { ...PARK })).toBe(true);
    expect(isSameLocationRequest(PARK, { ...PARK, name: 'Otro' })).toBe(false);
    expect(isSameLocationRequest(null, PARK)).toBe(false);
    expect(isSameLocationRequest(null, null)).toBe(true);
  });
});
