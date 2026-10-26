import { parseLocationLink } from './location-link';

const RETIRO = { latitude: 40.4153, longitude: -3.6844 };

describe('parseLocationLink', () => {
  it.each([
    ['a WhatsApp or Google Maps share', 'https://maps.google.com/?q=40.4153,-3.6844', RETIRO],
    [
      'a share with text around it',
      'Aquí es la clase: https://maps.google.com/?q=40.4153,-3.6844 ¡no llegues tarde!',
      RETIRO,
    ],
    ['an encoded comma', 'https://www.google.com/maps?q=40.4153%2C-3.6844', RETIRO],
    [
      'a Google Maps place',
      'https://www.google.com/maps/place/Retiro/@40.4153,-3.6844,17z/data=!3m1',
      RETIRO,
    ],
    [
      'the exact point of a Google Maps place',
      'https://www.google.com/maps/place/Retiro/data=!3d40.4153!4d-3.6844',
      RETIRO,
    ],
    ['an Apple Maps link', 'https://maps.apple.com/?ll=40.4153,-3.6844&q=Retiro', RETIRO],
    ['a geo link', 'geo:40.4153,-3.6844?q=Retiro', RETIRO],
    ['written coordinates', '40.4153, -3.6844', RETIRO],
    [
      'coordinates in the southern and western hemispheres',
      '-33.8688,151.2093',
      {
        latitude: -33.8688,
        longitude: 151.2093,
      },
    ],
  ])('reads the point of %s', (_case, text, expectedPoint) => {
    expect(parseLocationLink(text)).toEqual(expectedPoint);
  });

  it.each([
    ['an empty text', ''],
    ['a short Google link, which only redirects', 'https://maps.app.goo.gl/AbCdEf123'],
    ['a link without a point', 'https://www.google.com/maps/search/parque'],
    ['a latitude out of range', '95.0, 10.0'],
    ['a longitude out of range', '40.0, 200.0'],
    ['plain words', 'en el parque, junto al estanque'],
    ['a broken percent sign', '100% sin punto'],
  ])('finds nothing in %s', (_case, text) => {
    expect(parseLocationLink(text)).toBeNull();
  });
});
