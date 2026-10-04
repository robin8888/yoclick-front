import { fireEvent, screen } from '@testing-library/react-native';

import {
  MIN_TOUCH_TARGET_SIZE,
  buildTheme,
  calculateContrastRatio,
  colorTokens,
} from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Button } from './Button';
import type { ButtonVariant } from './Button.types';

const BRAND_HEX_COLOR = '#E4572E';

describe('Button', () => {
  it('is announced as a button with its visible text as name', () => {
    renderInTheme(<Button label="Reservar cita" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Reservar cita' })).toBeOnTheScreen();
  });

  it('calls onPress when pressed', () => {
    const handlePress = jest.fn();
    renderInTheme(<Button label="Reservar cita" onPress={handlePress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Reservar cita' }));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('lets screen readers hear a longer label than the visible text', () => {
    renderInTheme(
      <Button label="Pagar" accessibilityLabel="Pagar 35 € y reservar" onPress={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Pagar 35 € y reservar' })).toBeOnTheScreen();
  });

  describe('variants', () => {
    const brandColors = buildTheme({ mode: 'light', brandHexColor: BRAND_HEX_COLOR }).colors;

    it.each([
      ['primary', brandColors.brand, brandColors.onBrand],
      ['secondary', brandColors.surface2, brandColors.ink],
      ['outline', 'transparent', brandColors.ink],
      ['ghost', 'transparent', brandColors.brandInk],
      ['danger', brandColors.danger, brandColors.onDanger],
    ] as const)('%s uses the right fill and text tokens', (variant, fill, textColor) => {
      renderInTheme(<Button label="Acción" variant={variant} onPress={jest.fn()} />, {
        brandHexColor: BRAND_HEX_COLOR,
      });

      expect(screen.getByRole('button', { name: 'Acción' })).toHaveStyle({ backgroundColor: fill });
      expect(screen.getByText('Acción')).toHaveStyle({ color: textColor });
    });

    it('draws the outline border with the strong line token', () => {
      renderInTheme(<Button label="Acción" variant="outline" onPress={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Acción' })).toHaveStyle({
        borderColor: colorTokens.light.lineStrong,
        borderWidth: 1.5,
      });
    });

    it('writes ghost text in brandInk, never in the raw brand color', () => {
      renderInTheme(<Button label="Acción" variant="ghost" onPress={jest.fn()} />, {
        brandHexColor: BRAND_HEX_COLOR,
      });

      expect(screen.getByText('Acción')).toHaveStyle({ color: '#B64625' });
      expect(screen.getByText('Acción')).not.toHaveStyle({ color: BRAND_HEX_COLOR });
    });
  });

  describe('contrast on the brand fill', () => {
    it.each(['#E4572E', '#FFD400', '#0B3D91', '#1B7F3B'])(
      'primary text keeps AA contrast for brand %s in both modes',
      (brandHexColor) => {
        (['light', 'dark'] as const).forEach((mode) => {
          const { colors } = buildTheme({ mode, brandHexColor });

          expect(calculateContrastRatio(colors.onBrand, colors.brand)).toBeGreaterThanOrEqual(4.5);
        });
      },
    );

    it('paints the primary text with the onBrand computed by the brand engine', () => {
      renderInTheme(<Button label="Acción" onPress={jest.fn()} />, { brandHexColor: '#FFD400' });

      const { colors } = buildTheme({ mode: 'light', brandHexColor: '#FFD400' });
      expect(screen.getByText('Acción')).toHaveStyle({ color: colors.onBrand });
      expect(screen.getByRole('button', { name: 'Acción' })).toHaveStyle({
        backgroundColor: colors.brand,
      });
    });
  });

  describe('sizes', () => {
    it.each([
      ['sm', MIN_TOUCH_TARGET_SIZE],
      ['md', 48],
      ['lg', 56],
    ] as const)('%s is at least %i px tall', (size, expectedMinHeight) => {
      renderInTheme(<Button label="Acción" size={size} onPress={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Acción' })).toHaveStyle({
        minHeight: expectedMinHeight,
      });
    });

    it('never goes below the minimum touch target', () => {
      renderInTheme(<Button label="OK" size="sm" onPress={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'OK' })).toHaveStyle({
        minHeight: MIN_TOUCH_TARGET_SIZE,
        minWidth: MIN_TOUCH_TARGET_SIZE,
      });
    });

    it('can stretch to the full width', () => {
      renderInTheme(<Button label="Acción" isFullWidth onPress={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Acción' })).toHaveStyle({ alignSelf: 'stretch' });
    });
  });

  describe('disabled', () => {
    it.each<ButtonVariant>(['primary', 'secondary', 'outline', 'ghost', 'danger'])(
      '%s ignores presses, is announced as disabled and dims its text',
      (variant) => {
        const handlePress = jest.fn();
        renderInTheme(<Button label="Acción" variant={variant} isDisabled onPress={handlePress} />);

        fireEvent.press(screen.getByRole('button', { name: 'Acción' }));

        expect(handlePress).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Acción' })).toBeDisabled();
        expect(screen.getByText('Acción')).toHaveStyle({ color: colorTokens.light.ink2 });
      },
    );
  });

  describe('loading', () => {
    it('is announced as busy, ignores presses and keeps the variant colors', () => {
      const handlePress = jest.fn();
      renderInTheme(<Button label="Guardar cambios" isLoading onPress={handlePress} />);

      fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

      expect(handlePress).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeBusy();
      expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
      expect(screen.getByText('Guardar cambios')).toHaveStyle({
        color: buildTheme({ mode: 'light' }).colors.onBrand,
      });
    });

    it('keeps the text visible so the button does not change width', () => {
      renderInTheme(<Button label="Guardar cambios" isLoading onPress={jest.fn()} />);

      expect(screen.getByText('Guardar cambios')).toBeOnTheScreen();
    });

    it('is not busy when idle', () => {
      renderInTheme(<Button label="Guardar cambios" onPress={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Guardar cambios' })).not.toBeBusy();
    });
  });

  it('shows a decorative leading icon without changing its accessible name', () => {
    renderInTheme(<Button label="Añadir" leadingIconName="plus" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Añadir' })).toBeOnTheScreen();
    expect(screen.queryByRole('img')).not.toBeOnTheScreen();
  });

  it('uses theme colors in dark mode', () => {
    renderInTheme(<Button label="Acción" variant="secondary" onPress={jest.fn()} />, {
      mode: 'dark',
    });

    expect(screen.getByRole('button', { name: 'Acción' })).toHaveStyle({
      backgroundColor: colorTokens.dark.surface2,
    });
  });
});
