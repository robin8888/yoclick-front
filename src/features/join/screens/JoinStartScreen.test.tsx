import { fireEvent, screen } from '@testing-library/react-native';

import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { JoinStartScreen } from './JoinStartScreen';

describe('JoinStartScreen', () => {
  beforeEach(resetMockRouter);

  it('offers the code and the search entries under the platform heading', () => {
    renderScreen(<JoinStartScreen />);

    expect(screen.getByRole('heading', { name: 'Encuentra tu centro' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Tengo un código/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Buscar por nombre o ciudad/ })).toBeOnTheScreen();
  });

  it('shows the YoClick logo above the title', () => {
    renderScreen(<JoinStartScreen />);

    expect(screen.getAllByRole('img', { name: 'YoClick' })).toHaveLength(1);
  });

  it('goes to the code screen', () => {
    renderScreen(<JoinStartScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Tengo un código/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/join/code');
  });

  it('goes to the search screen', () => {
    renderScreen(<JoinStartScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Buscar por nombre o ciudad/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/join/search');
  });

  it('lets people who already have an account sign in', () => {
    renderScreen(<JoinStartScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Ya tengo cuenta' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/login');
  });

  it('goes to the QR scanner', () => {
    renderScreen(<JoinStartScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Escanear el QR del centro/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/join/scan');
  });

  it('explains how invitation links work', () => {
    renderScreen(<JoinStartScreen />);

    expect(screen.getByText(/enlace de invitación/)).toBeOnTheScreen();
  });

  it('starts the center creation flow from the footer prompt', () => {
    renderScreen(<JoinStartScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crea la app de tu centro' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/register');
  });
});
