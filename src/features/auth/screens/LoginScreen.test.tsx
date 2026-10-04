/* eslint-disable sonarjs/no-hardcoded-passwords -- contraseñas de prueba, no credenciales reales */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { getSessionServices } from '@/shared/auth/default-session-services';
import {
  buildAuthenticatedLoginResponse,
  buildMfaChallengeResponse,
  NORTE_CENTER_ID,
} from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '@/features/join';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { LoginScreen } from './LoginScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('@/shared/auth/default-session-services', () => ({ getSessionServices: jest.fn() }));

const startSession = jest.fn();

function signInWith(email: string, password: string): void {
  fireEvent.changeText(screen.getByLabelText('Correo electrónico'), email);
  fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

describe('LoginScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    startSession.mockReset().mockResolvedValue(undefined);
    jest.mocked(getSessionServices).mockReturnValue({ startSession } as never);
    usePendingCenterStore.getState().clearPendingCenter();
    useAuthFlowStore.setState({ notice: null, mfaChallengeToken: null });
  });

  it('names the center the person is joining', () => {
    usePendingCenterStore.getState().selectPendingCenter({
      id: NORTE_CENTER_ID,
      name: 'Studio Norte',
      sectorId: 'estudio',
      brandHexColor: '#E4572E',
    });
    renderScreen(<LoginScreen />);

    expect(screen.getByText('Entra en Studio Norte')).toBeOnTheScreen();
  });

  it('starts the session with the returned tokens and goes to the root', async () => {
    mockApi({ 'POST /v1/auth/login': buildAuthenticatedLoginResponse() });
    renderScreen(<LoginScreen />);

    signInWith('marta@correo.es', 'una-clave-larga-1');

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/');
    });
    expect(startSession).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-marta', email: 'marta@correo.es', fullName: 'Marta Ruiz' },
    });
    expect(findApiCall('POST', '/v1/auth/login')?.body).toEqual({
      email: 'marta@correo.es',
      password: 'una-clave-larga-1',
    });
  });

  it('keeps the challenge in memory and moves to the second factor when the API asks for it', async () => {
    mockApi({ 'POST /v1/auth/login': buildMfaChallengeResponse() });
    renderScreen(<LoginScreen />);

    signInWith('marta@correo.es', 'una-clave-larga-1');

    await waitFor(() => {
      expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/mfa');
    });
    expect(useAuthFlowStore.getState().mfaChallengeToken).toBe('mfa-challenge-token');
    expect(startSession).not.toHaveBeenCalled();
  });

  it('shows the generic credentials message when the login is rejected', async () => {
    mockApi({
      'POST /v1/auth/login': () => {
        throw buildApiError('INVALID_CREDENTIALS', 401);
      },
    });
    renderScreen(<LoginScreen />);

    signInWith('marta@correo.es', 'otra-clave-larga-1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
    expect(startSession).not.toHaveBeenCalled();
  });

  it('validates the form before calling the API', async () => {
    mockApi({});
    renderScreen(<LoginScreen />);

    signInWith('marta', '');

    expect(await screen.findByText('El correo no parece válido')).toBeOnTheScreen();
    expect(screen.getByText('Escribe tu contraseña')).toBeOnTheScreen();
    expect(findApiCall('POST', '/v1/auth/login')).toBeUndefined();
  });

  it('shows the confirmation left by the previous step', () => {
    useAuthFlowStore.setState({ notice: 'passwordChanged' });
    renderScreen(<LoginScreen />);

    expect(screen.getByText('Contraseña cambiada. Entra con la nueva.')).toBeOnTheScreen();
  });

  it('links to the password recovery and to the sign up', () => {
    renderScreen(<LoginScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'He olvidado mi contraseña' }));
    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/forgot-password');
    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/register');
  });
});
