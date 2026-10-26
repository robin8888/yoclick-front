import { buildDirectionsUrl, describeSessionLocation } from './session-location';

const PARK_WITH_POINT = {
  name: 'Parque del Retiro',
  address: 'Plaza de la Independencia 7, Madrid',
  latitude: 40.4153,
  longitude: -3.6844,
};
const AUDITORIUM_WITHOUT_POINT = {
  name: 'Auditorio Municipal',
  address: null,
  latitude: null,
  longitude: null,
};

describe('describeSessionLocation', () => {
  it.each([
    [PARK_WITH_POINT, 'Lugar: Parque del Retiro · Plaza de la Independencia 7, Madrid'],
    [AUDITORIUM_WITHOUT_POINT, 'Lugar: Auditorio Municipal'],
  ])('says where the class is (%#)', (location, expectedText) => {
    expect(describeSessionLocation(location)).toBe(expectedText);
  });
});

describe('buildDirectionsUrl', () => {
  it.each([
    [
      PARK_WITH_POINT,
      'ios',
      'https://maps.apple.com/?daddr=40.4153%2C-3.6844&q=Parque%20del%20Retiro',
    ],
    [
      PARK_WITH_POINT,
      'android',
      'https://www.google.com/maps/dir/?api=1&destination=40.4153%2C-3.6844',
    ],
    [
      AUDITORIUM_WITHOUT_POINT,
      'android',
      'https://www.google.com/maps/dir/?api=1&destination=Auditorio%20Municipal',
    ],
    [
      AUDITORIUM_WITHOUT_POINT,
      'other',
      'https://www.google.com/maps/dir/?api=1&destination=Auditorio%20Municipal',
    ],
  ] as const)(
    'opens the route in the maps of the phone (%#)',
    (location, platform, expectedUrl) => {
      expect(buildDirectionsUrl(location, platform)).toBe(expectedUrl);
    },
  );
});
