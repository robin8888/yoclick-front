import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildMembership, NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MyDataScreen } from './MyDataScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const PROFILE = {
  id: 'user-marta',
  email: 'marta@correo.es',
  fullName: 'Marta Ruiz',
  phone: null,
  address: null,
  birthDate: '1990-05-17',
  locale: 'es-ES',
  photoUrl: null,
  isEmailVerified: true,
  createdAt: '2026-01-10T10:00:00.000Z',
};

describe('MyDataScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    mockApi({
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
      'GET /v1/me': PROFILE,
      'PATCH /v1/me': { ...PROFILE, phone: '+34 600 123 456' },
    });
  });

  it('shows what the center knows about me', async () => {
    renderScreen(<MyDataScreen />);

    expect(await screen.findByText('Marta Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('marta@correo.es')).toBeOnTheScreen();
    expect(screen.getByText('17/05/1990')).toBeOnTheScreen();
    expect(screen.getByText('Esto es lo que Studio Norte tiene de ti')).toBeOnTheScreen();
  });

  it('saves only the phone I add', async () => {
    renderScreen(<MyDataScreen />);
    fireEvent.changeText(await screen.findByLabelText('Teléfono'), '+34 600 123 456');

    fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', '/v1/me')?.body).toEqual({ phone: '+34 600 123 456' });
    });
  });

  it('does not let a wrong phone be saved', async () => {
    renderScreen(<MyDataScreen />);
    fireEvent.changeText(await screen.findByLabelText('Teléfono'), 'abc');

    expect(screen.getByText('Escribe un teléfono válido, como +34 600 123 456')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });
});
