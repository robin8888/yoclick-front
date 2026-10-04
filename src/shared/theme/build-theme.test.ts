import { buildTheme } from './build-theme';
import { colorTokens, radiusTokens, spaceTokens } from './tokens';

describe('buildTheme', () => {
  it('uses the documented neutrals for each mode', () => {
    expect(buildTheme({ mode: 'light' }).colors.bg).toBe('#F5F5F2');
    expect(buildTheme({ mode: 'dark' }).colors.bg).toBe('#0D0E10');
  });

  it('computes brand colors from the center color', () => {
    const { colors } = buildTheme({ mode: 'light', brandHexColor: '#E4572E' });

    expect(colors).toMatchObject({
      brand: '#E4572E',
      onBrand: '#000000',
      brandInk: '#B64625',
      brandSoft: '#FCEBE6',
    });
  });

  it('uses the neutral ink as brand when there is no center color', () => {
    const { colors } = buildTheme({ mode: 'light' });

    expect(colors.brand).toBe(colorTokens.light.ink);
  });

  it('recomputes brandInk and brandSoft for dark mode but keeps the brand hex', () => {
    const { colors } = buildTheme({ mode: 'dark', brandHexColor: '#E4572E' });

    expect(colors).toMatchObject({ brand: '#E4572E', brandInk: '#E8724F', brandSoft: '#3F251F' });
  });

  it('exposes space, radius, type and motion tokens', () => {
    const theme = buildTheme({ mode: 'light' });

    expect(theme.space).toBe(spaceTokens);
    expect(theme.radius).toBe(radiusTokens);
    expect(theme.type.body).toMatchObject({ fontSize: 15, lineHeight: 22, fontFamily: 'sans' });
    expect(theme.motion.durationPressMs).toBe(120);
  });
});
