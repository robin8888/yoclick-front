import { resolveFontFaceName } from './font-faces';
import { typeStyleTokens } from './tokens';

describe('resolveFontFaceName', () => {
  it.each([
    ['sans', '400', 'Figtree_400Regular'],
    ['sans', '500', 'Figtree_500Medium'],
    ['sans', '600', 'Figtree_600SemiBold'],
    ['sans', '700', 'Figtree_700Bold'],
    ['display', '700', 'Archivo_700Bold'],
    ['display', '800', 'Archivo_800ExtraBold'],
  ] as const)('maps %s weight %s to %s', (fontFamily, fontWeight, expectedFaceName) => {
    expect(resolveFontFaceName({ fontFamily, fontWeight })).toBe(expectedFaceName);
  });

  it('picks the closest available weight when the exact one is not loaded', () => {
    expect(resolveFontFaceName({ fontFamily: 'display', fontWeight: '400' })).toBe(
      'Archivo_700Bold',
    );
    expect(resolveFontFaceName({ fontFamily: 'sans', fontWeight: '800' })).toBe('Figtree_700Bold');
  });

  it('has a loaded face for every style of the type scale', () => {
    for (const typeStyle of Object.values(typeStyleTokens)) {
      const { fontFamily, fontWeight } = typeStyle;

      expect(resolveFontFaceName({ fontFamily, fontWeight })).toMatch(/^(Archivo|Figtree)_/);
    }
  });
});
