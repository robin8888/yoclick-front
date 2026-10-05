import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';

import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MfaSetupScreen } from './MfaSetupScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SETUP_RESPONSE = {
  secret: 'JBSWY3DPEHPK3PXP',
  provisioningUri: 'otpauth://totp/Yoclick:robin?secret=JBSWY3DPEHPK3PXP&issuer=Yoclick',
};
const RECOVERY_CODES = Array.from({ length: 10 }, (_unused, index) => `RCODE-${String(index + 1)}`);

async function reachScanStep(): Promise<void> {
  fireEvent.changeText(screen.getByLabelText('Contraseña'), 'Nosnibor88');
  fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
  await screen.findByText('Conecta tu app de autenticación');
}

describe('MfaSetupScreen', () => {
  beforeEach(() => {
    resetMockRouter();
  });

  it('asks for the password first and shows the QR and the key after it', async () => {
    mockApi({ 'POST /v1/me/mfa/totp/setup': SETUP_RESPONSE });
    renderScreen(<MfaSetupScreen />);

    await reachScanStep();

    expect(findApiCall('POST', '/v1/me/mfa/totp/setup')?.body).toEqual({ password: 'Nosnibor88' });
    expect(
      screen.getByRole('img', { name: 'Código QR para configurar la app de autenticación' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('JBSW Y3DP EHPK 3PXP')).toBeOnTheScreen();
  });

  it('shows the server error when the password is wrong and stays on the first step', async () => {
    mockApi({
      'POST /v1/me/mfa/totp/setup': () => {
        throw buildApiError('INVALID_CREDENTIALS', 401);
      },
    });
    renderScreen(<MfaSetupScreen />);

    fireEvent.changeText(screen.getByLabelText('Contraseña'), 'mal');
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(screen.queryByText('Conecta tu app de autenticación')).not.toBeOnTheScreen();
  });

  it('opens the authenticator app with the provisioning link', async () => {
    mockApi({ 'POST /v1/me/mfa/totp/setup': SETUP_RESPONSE });
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    renderScreen(<MfaSetupScreen />);
    await reachScanStep();

    fireEvent.press(screen.getByRole('button', { name: 'Abrir en mi app de autenticación' }));

    expect(openUrlSpy).toHaveBeenCalledWith(SETUP_RESPONSE.provisioningUri);
  });

  it('activates with the first code and then shows the ten recovery codes once', async () => {
    mockApi({
      'POST /v1/me/mfa/totp/setup': SETUP_RESPONSE,
      'POST /v1/me/mfa/totp/confirm': { recoveryCodes: RECOVERY_CODES },
      'GET /v1/me/mfa': { isEnabled: true, recoveryCodesRemaining: 10 },
    });
    renderScreen(<MfaSetupScreen />);
    await reachScanStep();

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
    fireEvent.press(screen.getByRole('button', { name: 'Activar verificación' }));

    expect(await screen.findByText('Guarda tus códigos de recuperación')).toBeOnTheScreen();
    expect(findApiCall('POST', '/v1/me/mfa/totp/confirm')?.body).toEqual({ code: '123456' });
    for (const recoveryCode of RECOVERY_CODES) {
      expect(screen.getByText(recoveryCode)).toBeOnTheScreen();
    }
  });

  it('requires six digits before activating', async () => {
    mockApi({ 'POST /v1/me/mfa/totp/setup': SETUP_RESPONSE });
    renderScreen(<MfaSetupScreen />);
    await reachScanStep();

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '12');
    fireEvent.press(screen.getByRole('button', { name: 'Activar verificación' }));

    expect(await screen.findByText('El código tiene 6 dígitos')).toBeOnTheScreen();
    expect(findApiCall('POST', '/v1/me/mfa/totp/confirm')).toBeUndefined();
  });

  it('shares the recovery codes', async () => {
    mockApi({
      'POST /v1/me/mfa/totp/setup': SETUP_RESPONSE,
      'POST /v1/me/mfa/totp/confirm': { recoveryCodes: RECOVERY_CODES },
      'GET /v1/me/mfa': { isEnabled: true, recoveryCodesRemaining: 10 },
    });
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    renderScreen(<MfaSetupScreen />);
    await reachScanStep();
    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
    fireEvent.press(screen.getByRole('button', { name: 'Activar verificación' }));
    await screen.findByText('Guarda tus códigos de recuperación');

    fireEvent.press(screen.getByRole('button', { name: 'Compartir códigos' }));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledWith({
        message: expect.stringContaining('RCODE-1') as string,
      });
    });
    await act(async () => {
      await Promise.resolve();
    });
  });
});
