import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { FormErrorBanner } from './FormErrorBanner';

describe('FormErrorBanner', () => {
  it('announces an error as an alert', () => {
    renderInTheme(<FormErrorBanner message="Correo o contraseña incorrectos" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
  });

  it('shows a success message without alert role', () => {
    renderInTheme(<FormErrorBanner tone="success" message="Contraseña cambiada" />);

    expect(screen.getByText('Contraseña cambiada')).toBeOnTheScreen();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });
});
