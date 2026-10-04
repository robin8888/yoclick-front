import { fireEvent, screen } from '@testing-library/react-native';

import { MIN_TOUCH_TARGET_SIZE, colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import type { IconName } from '../Icon';
import { Input } from './Input';
import { INPUT_MIN_HEIGHT } from './Input.styles';

interface EmailInputOverrides {
  value?: string;
  isInvalid?: boolean;
  invalidAccessibilityLabel?: string;
  isDisabled?: boolean;
  leadingIconName?: IconName;
  onFocus?: () => void;
  onBlur?: () => void;
}

function renderEmailInput(overrides: EmailInputOverrides = {}): jest.Mock {
  const handleChangeText = jest.fn();
  renderInTheme(
    <Input
      value="marta@example.com"
      onChangeText={handleChangeText}
      accessibilityLabel="Correo electrónico"
      placeholder="tu@correo.com"
      {...overrides}
    />,
  );
  return handleChangeText;
}

// El contenedor con borde es la raíz renderizada: se comprueba su estilo desde el árbol host.
function expectContainerStyle(expectedStyle: Record<string, unknown>): void {
  expect(screen.toJSON()).toMatchObject({ props: { style: expectedStyle } });
}

describe('Input', () => {
  it('is reachable by its accessibility label and shows the value', () => {
    renderEmailInput();

    expect(screen.getByLabelText('Correo electrónico')).toHaveDisplayValue('marta@example.com');
  });

  it('reports what the user types', () => {
    const handleChangeText = renderEmailInput();

    fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'lucia@example.com');

    expect(handleChangeText).toHaveBeenCalledWith('lucia@example.com');
  });

  it('shows the placeholder with the secondary ink color', () => {
    renderEmailInput({ value: '' });

    expect(screen.getByPlaceholderText('tu@correo.com').props).toMatchObject({
      placeholderTextColor: colorTokens.light.ink2,
    });
  });

  it('is 48 px tall (above the 44 px minimum) and uses the strong line for its border (3:1)', () => {
    renderEmailInput();

    expect(INPUT_MIN_HEIGHT).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    expectContainerStyle({
      minHeight: INPUT_MIN_HEIGHT,
      borderColor: colorTokens.light.lineStrong,
    });
  });

  it('highlights the field with the focus ring color while focused', () => {
    renderEmailInput();
    const field = screen.getByLabelText('Correo electrónico');

    fireEvent(field, 'focus');
    expectContainerStyle({ borderColor: colorTokens.light.focus, borderWidth: 2 });

    fireEvent(field, 'blur');
    expectContainerStyle({ borderColor: colorTokens.light.lineStrong, borderWidth: 1 });
  });

  it('forwards focus and blur to the caller', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    renderEmailInput({ onFocus: handleFocus, onBlur: handleBlur });
    const field = screen.getByLabelText('Correo electrónico');

    fireEvent(field, 'focus');
    fireEvent(field, 'blur');

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  describe('error state', () => {
    it('draws a danger border and an icon, so the error is not only a color', () => {
      renderEmailInput({
        isInvalid: true,
        invalidAccessibilityLabel: 'Hay un error en este campo',
      });

      expectContainerStyle({ borderColor: colorTokens.light.danger, borderWidth: 2 });
      expect(screen.getByRole('img', { name: 'Hay un error en este campo' })).toBeOnTheScreen();
    });

    it('has no error icon when valid', () => {
      renderEmailInput();

      expect(screen.queryByRole('img')).not.toBeOnTheScreen();
    });
  });

  describe('disabled', () => {
    it('is not editable and uses the muted surface', () => {
      renderEmailInput({ isDisabled: true });

      expect(screen.getByLabelText('Correo electrónico').props).toMatchObject({ editable: false });
      expectContainerStyle({ backgroundColor: colorTokens.light.surface2 });
    });
  });

  describe('secure text', () => {
    function renderPasswordInput(): void {
      renderInTheme(
        <Input
          value="secreta123"
          onChangeText={jest.fn()}
          accessibilityLabel="Contraseña"
          isSecure
          showSecureTextLabel="Mostrar contraseña"
          hideSecureTextLabel="Ocultar contraseña"
        />,
      );
    }

    it('hides the text by default and offers an accessible button to show it', () => {
      renderPasswordInput();

      expect(screen.getByLabelText('Contraseña').props).toMatchObject({ secureTextEntry: true });
      expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeOnTheScreen();
    });

    it('toggles visibility and updates the button name', () => {
      renderPasswordInput();

      fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));

      expect(screen.getByLabelText('Contraseña').props).toMatchObject({ secureTextEntry: false });
      expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeOnTheScreen();

      fireEvent.press(screen.getByRole('button', { name: 'Ocultar contraseña' }));

      expect(screen.getByLabelText('Contraseña').props).toMatchObject({ secureTextEntry: true });
    });

    it('has no toggle on regular fields', () => {
      renderEmailInput();

      expect(screen.queryByRole('button')).not.toBeOnTheScreen();
      expect(screen.getByLabelText('Correo electrónico').props).toMatchObject({
        secureTextEntry: false,
      });
    });

    it('requires both toggle labels for secure inputs at compile time', () => {
      renderInTheme(
        // @ts-expect-error un campo seguro sin textos para mostrar/ocultar no compila
        <Input value="" onChangeText={jest.fn()} accessibilityLabel="Contraseña" isSecure />,
      );

      expect(screen.getByLabelText('Contraseña')).toBeOnTheScreen();
    });
  });

  it('shows a decorative leading icon', () => {
    renderEmailInput({ leadingIconName: 'search' });

    expect(screen.queryByRole('img')).not.toBeOnTheScreen();
    expect(JSON.stringify(screen.toJSON())).toContain('lucide-search');
  });

  it('allows font scaling so text can grow to 200 %', () => {
    renderEmailInput();

    expect(screen.getByLabelText('Correo electrónico').props).toMatchObject({
      allowFontScaling: true,
    });
  });
});
