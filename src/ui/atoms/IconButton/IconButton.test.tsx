import { fireEvent, screen } from '@testing-library/react-native';

import { MIN_TOUCH_TARGET_SIZE, buildTheme, colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('is announced as a button with the accessibility label as name', () => {
    renderInTheme(<IconButton iconName="close" accessibilityLabel="Cerrar" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeOnTheScreen();
  });

  it('calls onPress when pressed', () => {
    const handlePress = jest.fn();
    renderInTheme(
      <IconButton iconName="close" accessibilityLabel="Cerrar" onPress={handlePress} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('is exactly the minimum touch target size', () => {
    renderInTheme(<IconButton iconName="close" accessibilityLabel="Cerrar" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveStyle({
      width: MIN_TOUCH_TARGET_SIZE,
      height: MIN_TOUCH_TARGET_SIZE,
    });
  });

  it.each([
    ['plain', 'transparent'],
    ['tonal', colorTokens.light.surface2],
  ] as const)('%s variant uses the %s background', (variant, expectedBackground) => {
    renderInTheme(
      <IconButton
        iconName="search"
        accessibilityLabel="Buscar"
        variant={variant}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveStyle({
      backgroundColor: expectedBackground,
    });
  });

  it('brand variant fills with brand and draws the icon with onBrand', () => {
    renderInTheme(
      <IconButton
        iconName="plus"
        accessibilityLabel="Añadir"
        variant="brand"
        onPress={jest.fn()}
      />,
      { brandHexColor: '#E4572E' },
    );

    const { colors } = buildTheme({ mode: 'light', brandHexColor: '#E4572E' });
    expect(screen.getByRole('button', { name: 'Añadir' })).toHaveStyle({
      backgroundColor: colors.brand,
    });
    expect(JSON.stringify(screen.toJSON())).toContain(colors.onBrand);
  });

  it('ignores presses and is announced as disabled when disabled', () => {
    const handlePress = jest.fn();
    renderInTheme(
      <IconButton iconName="close" accessibilityLabel="Cerrar" isDisabled onPress={handlePress} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));

    expect(handlePress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();
  });
});
