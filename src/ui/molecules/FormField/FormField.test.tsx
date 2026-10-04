import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { FormField } from './FormField';

describe('FormField', () => {
  it('labels the input with the visible label', () => {
    renderInTheme(<FormField label="Correo electrónico" value="" onChangeText={jest.fn()} />);

    expect(screen.getByLabelText('Correo electrónico')).toBeOnTheScreen();
  });

  it('forwards typed text to the callback', () => {
    const handleChangeText = jest.fn();
    renderInTheme(
      <FormField label="Correo electrónico" value="" onChangeText={handleChangeText} />,
    );

    fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'marta@correo.es');

    expect(handleChangeText).toHaveBeenCalledWith('marta@correo.es');
  });

  it('shows the helper text while there is no error', () => {
    renderInTheme(
      <FormField
        label="Contraseña"
        helperText="Mínimo 10 caracteres."
        value=""
        onChangeText={jest.fn()}
      />,
    );

    expect(screen.getByText('Mínimo 10 caracteres.')).toBeOnTheScreen();
  });

  it('replaces the helper with an announced error message', () => {
    renderInTheme(
      <FormField
        label="Contraseña"
        helperText="Mínimo 10 caracteres."
        errorMessage="Usa al menos 10 caracteres"
        value=""
        onChangeText={jest.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Usa al menos 10 caracteres');
    expect(screen.queryByText('Mínimo 10 caracteres.')).not.toBeOnTheScreen();
  });
});
