import { resolveFontFaceName } from './font-faces';
import { typeStyleTokens } from './tokens';

describe('resolveFontFaceName', () => {
  it.each([
    ['sans', '400', 'Outfit_400Regular'],
    ['sans', '500', 'Outfit_500Medium'],
    ['sans', '600', 'Outfit_600SemiBold'],
    ['sans', '700', 'Outfit_700Bold'],
    ['display', '700', 'Outfit_700Bold'],
    ['display', '800', 'Outfit_800ExtraBold'],
    ['sans', '800', 'Outfit_800ExtraBold'],
  ] as const)('maps %s weight %s to %s', (fontFamily, fontWeight, expectedFaceName) => {
    expect(resolveFontFaceName({ fontFamily, fontWeight })).toBe(expectedFaceName);
  });

  it('picks the closest available weight when the exact one is not loaded', () => {
    expect(resolveFontFaceName({ fontFamily: 'sans', fontWeight: '300' as never })).toBe(
      'Outfit_400Regular',
    );
  });

  it('has a loaded face for every style of the type scale', () => {
    for (const typeStyle of Object.values(typeStyleTokens)) {
      const { fontFamily, fontWeight } = typeStyle;

      expect(resolveFontFaceName({ fontFamily, fontWeight })).toMatch(/^Outfit_/);
    }
  });
});
