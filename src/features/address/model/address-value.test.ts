import {
  applyTypedText,
  buildAddressFromSuggestion,
  buildTypedAddress,
  shouldKeepCoordinates,
  type AddressValue,
} from './address-value';
import { getCountryCodeForTimeZone } from './address-kind';

const pickedAddress: AddressValue = {
  text: 'Calle Mayor 14, 28013 Madrid',
  latitude: 40.41644,
  longitude: -3.70627,
};

describe('shouldKeepCoordinates', () => {
  it.each([
    { situation: 'nothing was picked', pickedStreet: null, text: 'Calle Mayor 14', isKept: false },
    {
      situation: 'the street is still named',
      pickedStreet: 'Calle Mayor',
      text: 'Calle Mayor 14, esc. B, 28013 Madrid',
      isKept: true,
    },
    {
      situation: 'the case and accents differ',
      pickedStreet: 'Avenida de América',
      text: 'avenida de america 3',
      isKept: true,
    },
    {
      situation: 'the street was replaced by another',
      pickedStreet: 'Calle Mayor',
      text: 'Calle Alcalá 3',
      isKept: false,
    },
    { situation: 'the text was cleared', pickedStreet: 'Calle Mayor', text: '', isKept: false },
  ])('when $situation', ({ pickedStreet, text, isKept }) => {
    expect(shouldKeepCoordinates(pickedStreet, text)).toBe(isKept);
  });
});

describe('applyTypedText', () => {
  it('keeps the point when only the door is added to the picked street', () => {
    const result = applyTypedText({
      current: pickedAddress,
      pickedStreet: 'Calle Mayor',
      nextText: 'Calle Mayor 14, 3º B, 28013 Madrid',
    });

    expect(result).toEqual({
      text: 'Calle Mayor 14, 3º B, 28013 Madrid',
      latitude: 40.41644,
      longitude: -3.70627,
    });
  });

  it('drops the point when the street changes, because it would point somewhere else', () => {
    const result = applyTypedText({
      current: pickedAddress,
      pickedStreet: 'Calle Mayor',
      nextText: 'Calle Alcalá 3',
    });

    expect(result).toEqual(buildTypedAddress('Calle Alcalá 3'));
  });
});

describe('buildAddressFromSuggestion', () => {
  const suggestion = {
    label: 'Medellín, Antioquia, Colombia',
    street: null,
    houseNumber: null,
    city: 'Medellín',
    postcode: null,
    latitude: 6.26,
    longitude: -75.6,
  };

  it('writes only the name for a city', () => {
    expect(buildAddressFromSuggestion(suggestion, 'city')).toEqual({
      text: 'Medellín',
      latitude: 6.26,
      longitude: -75.6,
    });
  });

  it('writes the whole line for an address', () => {
    expect(buildAddressFromSuggestion(suggestion, 'address').text).toBe(
      'Medellín, Antioquia, Colombia',
    );
  });
});

describe('getCountryCodeForTimeZone', () => {
  it.each([
    ['America/Bogota', 'CO'],
    ['Europe/Madrid', 'ES'],
    ['Atlantic/Canary', 'ES'],
    ['Asia/Tokyo', 'ES'],
  ])('maps %s to %s', (timeZone, countryCode) => {
    expect(getCountryCodeForTimeZone(timeZone)).toBe(countryCode);
  });
});
