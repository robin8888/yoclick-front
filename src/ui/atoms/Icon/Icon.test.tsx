import { screen } from '@testing-library/react-native';

import { colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Icon } from './Icon';
import { ICON_NAMES } from './Icon.types';
import { ICON_REGISTRY } from './icon-registry';

describe('Icon', () => {
  it('has a glyph for every declared icon name', () => {
    ICON_NAMES.forEach((iconName) => {
      expect(ICON_REGISTRY[iconName]).toBeDefined();
    });
  });

  it('is hidden from screen readers when it has no label (decorative)', () => {
    renderInTheme(<Icon name="check" />);

    expect(screen.queryByRole('img')).not.toBeOnTheScreen();
  });

  it('is announced as an image when it has a label', () => {
    renderInTheme(<Icon name="wifiOff" accessibilityLabel="Sin conexión" />);

    expect(screen.getByRole('img', { name: 'Sin conexión' })).toBeOnTheScreen();
  });

  it.each([
    ['inline', 18],
    ['navigation', 22],
    ['large', 32],
  ] as const)('draws the %s size at %i px', (size, expectedPixels) => {
    renderInTheme(<Icon name="check" size={size} accessibilityLabel="Hecho" />);

    expect(JSON.stringify(screen.toJSON())).toContain(`"width":${String(expectedPixels)}`);
  });

  it('takes its color from the theme tokens, in both modes', () => {
    renderInTheme(<Icon name="alertTriangle" color="danger" accessibilityLabel="Error" />, {
      mode: 'dark',
    });

    expect(JSON.stringify(screen.toJSON())).toContain(colorTokens.dark.danger);
  });
});
