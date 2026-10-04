/* eslint-disable sonarjs/no-hardcoded-passwords -- contraseñas de prueba, no credenciales reales */
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { VerifyEmailScreen } from './VerifyEmailScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

function setPendingEmail(pendingEmail: string | null): void {
  act(() => {
    useAuthFlowStore.setState({ pendingEmail, notice: null });
  });
}

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    setPendingEmail(null);
  });

  it('requests the code and continues to the reset step', async () => {
    mockApi({ 'POST /v1/auth/password/forgot': { status: 'reset_requested' } });
    renderScreen(<ForgotPasswordScreen />);

    fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'marta@correo.es');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar código' }));

    await waitFor(() => {
      expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/reset-password');
    });
    expect(useAuthFlowStore.getState().pendingEmail).toBe('marta@correo.es');
  });

  it('shows the rate limit message', async () => {
    mockApi({
      'POST /v1/auth/password/forgot': () => {
        throw buildApiError('RATE_LIMITED', 429);
      },
    });
    renderScreen(<ForgotPasswordScreen />);

    fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'marta@correo.es');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar código' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Demasiados intentos/);
  });
});

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    setPendingEmail('marta@correo.es');
  });

  it('goes back to the first step when no email is pending', () => {
    setPendingEmail(null);
    renderScreen(<ResetPasswordScreen />);

    expect(screen.getByText('redirect:/(auth)/forgot-password')).toBeOnTheScreen();
  });

  it('sets the new password and returns to the login with a confirmation', async () => {
    mockApi({ 'POST /v1/auth/password/reset': { status: 'password_changed' } });
    renderScreen(<ResetPasswordScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
    fireEvent.changeText(screen.getByLabelText('Nueva contraseña'), 'otra-clave-larga-2');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar contraseña' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/login');
    });
    expect(findApiCall('POST', '/v1/auth/password/reset')?.body).toEqual({
      email: 'marta@correo.es',
      code: '123456',
      newPassword: 'otra-clave-larga-2',
    });
    expect(useAuthFlowStore.getState().notice).toBe('passwordChanged');
  });

  it('shows the invalid code message', async () => {
    mockApi({
      'POST /v1/auth/password/reset': () => {
        throw buildApiError('VERIFICATION_CODE_INVALID', 400);
      },
    });
    renderScreen(<ResetPasswordScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
    fireEvent.changeText(screen.getByLabelText('Nueva contraseña'), 'otra-clave-larga-2');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El código no es válido o ha caducado',
    );
  });
});

describe('VerifyEmailScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    setPendingEmail('marta@correo.es');
  });

  it('goes to the login when there is no pending email', () => {
    setPendingEmail(null);
    renderScreen(<VerifyEmailScreen />);

    expect(screen.getByText('redirect:/(auth)/login')).toBeOnTheScreen();
  });

  it('verifies the six digit code and returns to the login', async () => {
    mockApi({ 'POST /v1/auth/email/verify': { status: 'verified' } });
    renderScreen(<VerifyEmailScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '654321');
    fireEvent.press(screen.getByRole('button', { name: 'Verificar correo' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/login');
    });
    expect(findApiCall('POST', '/v1/auth/email/verify')?.body).toEqual({
      email: 'marta@correo.es',
      code: '654321',
    });
    expect(useAuthFlowStore.getState().notice).toBe('emailVerified');
  });

  it('resends the code and says so without revealing whether the account exists', async () => {
    mockApi({ 'POST /v1/auth/email/resend': { status: 'verification_sent' } });
    renderScreen(<VerifyEmailScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Reenviar código' }));

    expect(
      await screen.findByText('Si el correo existe, te hemos enviado un código nuevo.'),
    ).toBeOnTheScreen();
  });

  it('shows the error when the code has expired', async () => {
    mockApi({
      'POST /v1/auth/email/verify': () => {
        throw buildApiError('VERIFICATION_CODE_INVALID', 400);
      },
    });
    renderScreen(<VerifyEmailScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '654321');
    fireEvent.press(screen.getByRole('button', { name: 'Verificar correo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El código no es válido o ha caducado',
    );
  });
});
