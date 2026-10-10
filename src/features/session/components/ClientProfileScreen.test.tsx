import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildMembership, NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ClientProfileScreen } from './ClientProfileScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

describe('ClientProfileScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({
        accessToken: 'token',
        user: { id: 'user-marta', fullName: 'Marta Ruiz', email: 'marta@correo.es' },
      });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    mockApi({
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
      'GET /v1/me': {
        id: 'user-marta',
        email: 'marta@correo.es',
        fullName: 'Marta Ruiz',
        phone: null,
        birthDate: null,
        locale: 'es-ES',
        photoUrl: null,
        isEmailVerified: true,
        createdAt: '2026-01-10T10:00:00.000Z',
      },
    });
  });

  it('shows who I am and the way to my centers, notices and privacy', async () => {
    renderScreen(<ClientProfileScreen />);

    expect(await screen.findByText('Marta Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('marta@correo.es')).toBeOnTheScreen();
    expect(await screen.findByText('1 centro · actual: Studio Norte')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: /Mis centros/ }));
    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/centers');
  });

  it('has the dark theme switch and the sign-out button', async () => {
    renderScreen(<ClientProfileScreen />);

    await screen.findByText('1 centro · actual: Studio Norte');

    expect(screen.getByRole('switch', { name: 'Tema oscuro' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeOnTheScreen();
  });

  it('opens my data from the profile', async () => {
    renderScreen(<ClientProfileScreen />);
    await screen.findByText('1 centro · actual: Studio Norte');

    fireEvent.press(screen.getByRole('button', { name: /Mis datos/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/my-data');
  });
});
