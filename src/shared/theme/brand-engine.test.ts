import fc from 'fast-check';

import {
  calculateContrastRatio,
  deriveBrandTokens,
  normalizeHexColor,
  type ThemeMode,
} from './brand-engine';

const LIGHT_NEUTRALS = { backgroundColor: '#F5F5F2', surfaceColor: '#FFFFFF' };
const DARK_NEUTRALS = { backgroundColor: '#0D0E10', surfaceColor: '#16181B' };
const NEUTRALS_BY_MODE = { light: LIGHT_NEUTRALS, dark: DARK_NEUTRALS } as const;

const MINIMUM_TEXT_CONTRAST_RATIO = 4.5;
const RANDOM_BRAND_COLOR_RUN_COUNT = 1000;

// Los seis vectores de docs/design/brand-engine.md (3 marcas × 2 temas).
// CLAUDE.md habla de «6 vectores» y 05-plan-de-trabajo.md de «3»: son las mismas 3 marcas.
const BRAND_TOKEN_VECTORS: readonly {
  brand: string;
  themeMode: ThemeMode;
  onBrand: string;
  brandInk: string;
  brandSoft: string;
}[] = [
  {
    brand: '#E4572E',
    themeMode: 'light',
    onBrand: '#000000',
    brandInk: '#B64625',
    brandSoft: '#FCEBE6',
  },
  {
    brand: '#E4572E',
    themeMode: 'dark',
    onBrand: '#000000',
    brandInk: '#E8724F',
    brandSoft: '#3F251F',
  },
  {
    brand: '#2446C7',
    themeMode: 'light',
    onBrand: '#FFFFFF',
    brandInk: '#2446C7',
    brandSoft: '#E5E9F8',
  },
  {
    brand: '#2446C7',
    themeMode: 'dark',
    onBrand: '#FFFFFF',
    brandInk: '#7389DB',
    brandSoft: '#19213D',
  },
  {
    brand: '#C8F031',
    themeMode: 'light',
    onBrand: '#000000',
    brandInk: '#607318',
    brandSoft: '#F8FDE6',
  },
  {
    brand: '#C8F031',
    themeMode: 'dark',
    onBrand: '#000000',
    brandInk: '#C8F031',
    brandSoft: '#3A431F',
  },
];

describe('deriveBrandTokens test vectors', () => {
  it.each(BRAND_TOKEN_VECTORS)(
    'derives the documented tokens for $brand in $themeMode mode',
    ({ brand, themeMode, onBrand, brandInk, brandSoft }) => {
      const brandTokens = deriveBrandTokens(brand, themeMode, NEUTRALS_BY_MODE[themeMode]);

      expect(brandTokens).toEqual({ brand, onBrand, brandInk, brandSoft });
    },
  );
});

describe('deriveBrandTokens normalization', () => {
  it('expands shorthand hex colors and uppercases them', () => {
    const brandTokens = deriveBrandTokens('#e53', 'light', LIGHT_NEUTRALS);

    expect(brandTokens.brand).toBe('#EE5533');
  });

  it('accepts hex colors without the leading hash', () => {
    const brandTokens = deriveBrandTokens('2446c7', 'light', LIGHT_NEUTRALS);

    expect(brandTokens.brand).toBe('#2446C7');
  });

  it.each(['', 'red', '#12', '#GGGGGG', '#12345', '#1234567', 'rgb(1,2,3)'])(
    'falls back to the neutral ink brand for the invalid color "%s"',
    (invalidColor) => {
      const brandTokens = deriveBrandTokens(invalidColor, 'light', LIGHT_NEUTRALS);

      expect(brandTokens.brand).toBe('#121416');
      expect(brandTokens.onBrand).toBe('#FFFFFF');
    },
  );

  it('uses the dark ink as neutral brand in dark mode', () => {
    const brandTokens = deriveBrandTokens('nope', 'dark', DARK_NEUTRALS);

    expect(brandTokens.brand).toBe('#F1F2F3');
    expect(brandTokens.onBrand).toBe('#000000');
  });
});

describe('deriveBrandTokens with unusable neutrals', () => {
  it('falls back to the mix target when no step reaches the contrast', () => {
    const darkNeutralsInLightMode = { backgroundColor: '#222222', surfaceColor: '#333333' };

    const brandTokens = deriveBrandTokens('#E4572E', 'light', darkNeutralsInLightMode);

    expect(brandTokens.brandInk).toBe('#000000');
  });
});

describe('normalizeHexColor', () => {
  it.each([
    ['#abc', '#AABBCC'],
    ['#AbCdEf', '#ABCDEF'],
    ['abc', '#AABBCC'],
    ['  #abc  ', '#AABBCC'],
  ])('normalizes %s to %s', (rawColor, expectedColor) => {
    expect(normalizeHexColor(rawColor)).toBe(expectedColor);
  });

  it('returns null for strings that are not hex colors', () => {
    expect(normalizeHexColor('#zzz')).toBeNull();
  });
});

describe('calculateContrastRatio', () => {
  it('returns 21 between black and white regardless of order', () => {
    expect(calculateContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(calculateContrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('returns 1 between identical colors', () => {
    expect(calculateContrastRatio('#E4572E', '#E4572E')).toBeCloseTo(1, 5);
  });
});

describe('deriveBrandTokens properties', () => {
  const brandColorArbitrary = fc
    .tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
    )
    .map(
      ([red, green, blue]) =>
        `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`,
    );

  it.each(['light', 'dark'] as const)(
    'keeps WCAG AA contrast for 1000 random brand colors in %s mode',
    (themeMode) => {
      const themeNeutrals = NEUTRALS_BY_MODE[themeMode];

      fc.assert(
        fc.property(brandColorArbitrary, (brandColor) => {
          const { brand, onBrand, brandInk, brandSoft } = deriveBrandTokens(
            brandColor,
            themeMode,
            themeNeutrals,
          );

          expect(calculateContrastRatio(onBrand, brand)).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST_RATIO,
          );
          expect(
            calculateContrastRatio(brandInk, themeNeutrals.surfaceColor),
          ).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST_RATIO);
          expect(
            calculateContrastRatio(brandInk, themeNeutrals.backgroundColor),
          ).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST_RATIO);
          expect(calculateContrastRatio(brandInk, brandSoft)).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST_RATIO,
          );
        }),
        { numRuns: RANDOM_BRAND_COLOR_RUN_COUNT },
      );
    },
  );

  it('is pure and deterministic', () => {
    fc.assert(
      fc.property(
        brandColorArbitrary,
        fc.constantFrom('light', 'dark'),
        (brandColor, themeMode) => {
          const first = deriveBrandTokens(brandColor, themeMode, NEUTRALS_BY_MODE[themeMode]);
          const second = deriveBrandTokens(brandColor, themeMode, NEUTRALS_BY_MODE[themeMode]);

          expect(second).toEqual(first);
        },
      ),
    );
  });
});
