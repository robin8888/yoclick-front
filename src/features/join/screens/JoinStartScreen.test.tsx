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
});
