import { act, fireEvent, screen } from '@testing-library/react-native';
import { Share } from 'react-native';

import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useCreatedCenterStore } from '../model/created-center-store';
import { CenterReadyScreen } from './CenterReadyScreen';

describe('CenterReadyScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useCreatedCenterStore.getState().saveCreatedCenter({
        centerId: 'center-1',
        name: 'Vértice Training',
        brandColor: '#7A3FE0',
        joinCode: 'VERTI9',
      });
    });
  });

  it('goes to the root when no center was just created', () => {
    act(() => {
      useCreatedCenterStore.getState().clearCreatedCenter();
    });
    renderScreen(<CenterReadyScreen />);

    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
  });

  it('shows the join code and the invitation link', () => {
    renderScreen(<CenterReadyScreen />);

    expect(
      screen.getByRole('heading', { name: '¡Vértice Training ya tiene app!' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('VERTI9')).toBeOnTheScreen();
    expect(screen.getByText('https://yoclick.app/j/VERTI9')).toBeOnTheScreen();
  });

  it('shares the code with the link', () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    renderScreen(<CenterReadyScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Compartir el código' }));

    expect(shareSpy).toHaveBeenCalledWith({
      message: expect.stringContaining('https://yoclick.app/j/VERTI9') as string,
    });
  });

  it('enters the panel through the root and forgets the created center', () => {
    renderScreen(<CenterReadyScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Ir a mi panel' }));

    expect(getMockRouter().replace).toHaveBeenCalledWith('/');
    expect(useCreatedCenterStore.getState().createdCenter).toBeNull();
  });
});
