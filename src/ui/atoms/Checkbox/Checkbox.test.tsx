import { fireEvent, screen } from '@testing-library/react-native';

import { MIN_TOUCH_TARGET_SIZE, buildTheme, colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is announced as an unchecked checkbox', () => {
    renderInTheme(
      <Checkbox
        isChecked={false}
        onCheckedChange={jest.fn()}
        accessibilityLabel="Acepto la política de privacidad"
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Acepto la política de privacidad' });
    expect(checkbox).not.toBeChecked();
  });

  it('is announced as checked and shows a check mark, not only a color', () => {
    renderInTheme(
      <Checkbox isChecked onCheckedChange={jest.fn()} accessibilityLabel="Acepto los términos" />,
    );

    expect(screen.getByRole('checkbox', { name: 'Acepto los términos' })).toBeChecked();
    expect(JSON.stringify(screen.toJSON())).toContain('"d":"M20 6 9 17l-5-5"');
  });

  it.each([
    [false, true],
    [true, false],
  ])('asks for %s → %s when pressed', (isChecked, shouldBeCheckedAfterPress) => {
    const handleCheckedChange = jest.fn();
    renderInTheme(
      <Checkbox
        isChecked={isChecked}
        onCheckedChange={handleCheckedChange}
        accessibilityLabel="Recibir novedades"
      />,
    );

    fireEvent.press(screen.getByRole('checkbox', { name: 'Recibir novedades' }));

    expect(handleCheckedChange).toHaveBeenCalledWith(shouldBeCheckedAfterPress);
  });

  it('has a 44 px touch target around a smaller box', () => {
    renderInTheme(
      <Checkbox
        isChecked={false}
        onCheckedChange={jest.fn()}
        accessibilityLabel="Recibir novedades"
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'Recibir novedades' })).toHaveStyle({
      width: MIN_TOUCH_TARGET_SIZE,
      height: MIN_TOUCH_TARGET_SIZE,
    });
  });

  it('fills with brand when checked', () => {
    renderInTheme(
      <Checkbox isChecked onCheckedChange={jest.fn()} accessibilityLabel="Recibir novedades" />,
      { brandHexColor: '#E4572E' },
    );

    expect(JSON.stringify(screen.toJSON())).toContain(
      buildTheme({ mode: 'light', brandHexColor: '#E4572E' }).colors.brand,
    );
  });

  it('draws a danger border when invalid', () => {
    renderInTheme(
      <Checkbox
        isChecked={false}
        isInvalid
        onCheckedChange={jest.fn()}
        accessibilityLabel="Acepto los términos"
      />,
    );

    expect(JSON.stringify(screen.toJSON())).toContain(colorTokens.light.danger);
  });

  it('ignores presses and is announced as disabled when disabled', () => {
    const handleCheckedChange = jest.fn();
    renderInTheme(
      <Checkbox
        isChecked={false}
        isDisabled
        onCheckedChange={handleCheckedChange}
        accessibilityLabel="Recibir novedades"
      />,
    );

    fireEvent.press(screen.getByRole('checkbox', { name: 'Recibir novedades' }));

    expect(handleCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Recibir novedades' })).toBeDisabled();
  });
});
