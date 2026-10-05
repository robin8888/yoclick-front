import { fireEvent, screen } from '@testing-library/react-native';

import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { StartScreen } from './StartScreen';

describe('StartScreen', () => {
  beforeEach(resetMockRouter);

  it('shows the logo and the two ways in', () => {
    renderScreen(<StartScreen />);

    expect(screen.getByRole('img', { name: 'YoClick' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeOnTheScreen();
  });

  it('goes to the registration', () => {
    renderScreen(<StartScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/register');
  });

  it('goes to the login', () => {
    renderScreen(<StartScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/login');
  });
});
