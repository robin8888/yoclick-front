import { convertHexToHsv, convertHsvToHex } from './color-conversion';

describe('convertHsvToHex', () => {
  it.each([
    { caseName: 'red', color: { hue: 0, saturation: 1, value: 1 }, expected: '#FF0000' },
    { caseName: 'green', color: { hue: 120, saturation: 1, value: 1 }, expected: '#00FF00' },
    { caseName: 'blue', color: { hue: 240, saturation: 1, value: 1 }, expected: '#0000FF' },
    { caseName: 'white', color: { hue: 200, saturation: 0, value: 1 }, expected: '#FFFFFF' },
    { caseName: 'black', color: { hue: 200, saturation: 1, value: 0 }, expected: '#000000' },
    {
      caseName: 'a hue past a full turn',
      color: { hue: 480, saturation: 1, value: 1 },
      expected: '#00FF00',
    },
    {
      caseName: 'a negative hue',
      color: { hue: -120, saturation: 1, value: 1 },
      expected: '#0000FF',
    },
  ])('writes $caseName', ({ color, expected }) => {
    expect(convertHsvToHex(color)).toBe(expected);
  });
});

describe('convertHexToHsv', () => {
  it.each([
    { caseName: 'red', hex: '#FF0000', expected: { hue: 0, saturation: 1, value: 1 } },
    { caseName: 'cyan', hex: '#00FFFF', expected: { hue: 180, saturation: 1, value: 1 } },
    {
      caseName: 'a mid gray',
      hex: '#808080',
      expected: { hue: 0, saturation: 0, value: 128 / 255 },
    },
    { caseName: 'black', hex: '#000000', expected: { hue: 0, saturation: 0, value: 0 } },
  ])('reads $caseName', ({ hex, expected }) => {
    const color = convertHexToHsv(hex);
    expect(color?.hue).toBeCloseTo(expected.hue);
    expect(color?.saturation).toBeCloseTo(expected.saturation);
    expect(color?.value).toBeCloseTo(expected.value);
  });

  it.each(['', '#FFF', 'FF0000', '#GG0000', '#FF00000'])('rejects %p', (text) => {
    expect(convertHexToHsv(text)).toBeNull();
  });

  it.each(['#E4572E', '#2446C7', '#0E8A6E', '#7A3FE0', '#C8F031'])(
    'gives back %s after a round trip',
    (hex) => {
      const color = convertHexToHsv(hex);
      expect(color).not.toBeNull();
      if (color !== null) expect(convertHsvToHex(color)).toBe(hex);
    },
  );
});
