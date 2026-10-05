import { fireEvent, screen } from '@testing-library/react-native';

import { NORTE_CENTER_ID } from '@/test/factories';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '../model/pending-center-store';
import { WelcomeScreen } from './WelcomeScreen';

describe('WelcomeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    usePendingCenterStore.getState().clearPendingCenter();
  });

  it('goes back to the start when no center was chosen', () => {
    renderScreen(<WelcomeScreen />);

    expect(screen.getByText('redirect:/join')).toBeOnTheScreen();
  });

  it('greets with the center name and the sector vocabulary', () => {
    usePendingCenterStore.getState().selectPendingCenter({
      id: NORTE_CENTER_ID,
      name: 'Studio Norte',
      sectorId: 'baile',
      brandHexColor: '#E4572E',
      logoUrl: null,
    });
    renderScreen(<WelcomeScreen />);

    expect(screen.getByRole('heading', { name: 'Studio Norte' })).toBeOnTheScreen();
    expect(
      screen.getByText('Reserva tus clases y sigue tu progreso en Studio Norte.'),
    ).toBeOnTheScreen();
  });

  it('continues to register or to sign in', () => {
    usePendingCenterStore.getState().selectPendingCenter({
      id: NORTE_CENTER_ID,
      name: 'Studio Norte',
      sectorId: 'estudio',
      brandHexColor: '#E4572E',
      logoUrl: null,
    });
    renderScreen(<WelcomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));
    fireEvent.press(screen.getByRole('button', { name: 'Ya tengo cuenta' }));

    expect(getMockRouter().push).toHaveBeenNthCalledWith(1, '/(auth)/register');
    expect(getMockRouter().push).toHaveBeenNthCalledWith(2, '/(auth)/login');
  });
});
