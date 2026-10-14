import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { InstructorHomeScreen } from './InstructorHomeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

describe('InstructorHomeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    mockApi({
      [`GET /v1/centers/${NORTE_CENTER_ID}/notifications`]: { unreadCount: 0, notifications: [] },
    });
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows the teacher accesses as big buttons with a line saying what each is for', () => {
    renderScreen(<InstructorHomeScreen />);

    expect(screen.getByRole('button', { name: 'Mi agenda' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mi QR de trabajo' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mi asistencia' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Escanea asistencia QR' })).toBeOnTheScreen();
    expect(screen.getByText('Para fichar tu entrada y salida')).toBeOnTheScreen();
  });

  it.each([
    { name: 'Mi agenda', route: '/(staff)/day-agenda' },
    { name: 'Mi QR de trabajo', route: '/(staff)/work-qr' },
    { name: 'Mi asistencia', route: '/(staff)/attendance' },
    { name: 'Escanea asistencia QR', route: '/(staff)/scan' },
  ])('opens $route from the button $name', ({ name, route }) => {
    renderScreen(<InstructorHomeScreen />);

    fireEvent.press(screen.getByRole('button', { name }));

    expect(getMockRouter().push).toHaveBeenCalledWith(route);
  });
});
