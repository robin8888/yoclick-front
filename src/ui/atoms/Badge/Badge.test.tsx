import { screen } from '@testing-library/react-native';

import { buildTheme, calculateContrastRatio } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Badge } from './Badge';

describe('Badge', () => {
  it('always shows its label as text', () => {
    renderInTheme(<Badge label="Confirmada" tone="success" />);

    expect(screen.getByText('Confirmada')).toBeOnTheScreen();
  });

  it.each([
    ['neutral', 'surface2', 'ink'],
    ['brand', 'brandSoft', 'brandInk'],
    ['success', 'successSoft', 'success'],
    ['warning', 'warningSoft', 'warning'],
    ['danger', 'dangerSoft', 'danger'],
    ['info', 'infoSoft', 'info'],
  ] as const)('%s uses the %s background with %s text', (tone, backgroundToken, textToken) => {
    renderInTheme(<Badge label="Estado" tone={tone} />, { brandHexColor: '#E4572E' });

    const { colors } = buildTheme({ mode: 'light', brandHexColor: '#E4572E' });
    expect(screen.getByText('Estado')).toHaveStyle({ color: colors[textToken] });
    expect(JSON.stringify(screen.toJSON())).toContain(colors[backgroundToken]);
  });

  it.each(['success', 'warning', 'danger', 'info'] as const)(
    '%s adds an icon so the state is not conveyed by color alone',
    (tone) => {
      renderInTheme(<Badge label="Estado" tone={tone} />);

      expect(JSON.stringify(screen.toJSON())).toContain('"d"');
    },
  );

  it.each(['neutral', 'brand'] as const)(
    '%s has no icon (it carries no status meaning)',
    (tone) => {
      renderInTheme(<Badge label="Estado" tone={tone} />);

      expect(JSON.stringify(screen.toJSON())).not.toContain('"d"');
    },
  );

  it('draws the success icon with the circle-check glyph', () => {
    renderInTheme(<Badge label="Confirmada" tone="success" />);

    expect(JSON.stringify(screen.toJSON())).toContain('lucide-circle-check');
  });

  it.each(['light', 'dark'] as const)(
    'keeps AA contrast between text and background in %s mode for every tone',
    (mode) => {
      const { colors } = buildTheme({ mode, brandHexColor: '#E4572E' });
      const pairs = [
        [colors.ink, colors.surface2],
        [colors.brandInk, colors.brandSoft],
        [colors.success, colors.successSoft],
        [colors.warning, colors.warningSoft],
        [colors.danger, colors.dangerSoft],
        [colors.info, colors.infoSoft],
      ] as const;

      pairs.forEach(([textColor, backgroundColor]) => {
        expect(calculateContrastRatio(textColor, backgroundColor)).toBeGreaterThanOrEqual(4.5);
      });
    },
  );
});
