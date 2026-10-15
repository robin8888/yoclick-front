import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { SetupGuideScreen } from './SetupGuideScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

describe('SetupGuideScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
  });

  it('lists the steps in order, grouped by phase', () => {
    renderScreen(<SetupGuideScreen />);

    expect(screen.getByText('Prepara tu centro')).toBeOnTheScreen();
    expect(screen.getByText('Equipo y bonos')).toBeOnTheScreen();
    expect(screen.getByText('Abre las puertas')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: /^1\. Completa los datos del centro/ }),
    ).toBeOnTheScreen();
  });

  it('opens the screen of the step that is pressed', () => {
    renderScreen(<SetupGuideScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Crea tus servicios/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/services');
  });
});
