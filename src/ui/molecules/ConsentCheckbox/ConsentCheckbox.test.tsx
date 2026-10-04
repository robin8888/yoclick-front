import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ConsentCheckbox } from './ConsentCheckbox';

describe('ConsentCheckbox', () => {
  it('exposes a checkbox named after the consent text with its checked state', () => {
    renderInTheme(
      <ConsentCheckbox
        isChecked={false}
        onCheckedChange={jest.fn()}
        label="Acepto la política de privacidad."
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Acepto la política de privacidad.', checked: false }),
    ).toBeOnTheScreen();
  });

  it('asks to flip the value when pressed', () => {
    const handleCheckedChange = jest.fn();
    renderInTheme(
      <ConsentCheckbox
        isChecked={false}
        onCheckedChange={handleCheckedChange}
        label="Acepto la política de privacidad."
      />,
    );

    fireEvent.press(screen.getByRole('checkbox'));

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('announces the error when the consent is missing', () => {
    renderInTheme(
      <ConsentCheckbox
        isChecked={false}
        onCheckedChange={jest.fn()}
        label="Acepto las condiciones."
        errorMessage="Tienes que aceptar las condiciones"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Tienes que aceptar las condiciones');
  });
});
