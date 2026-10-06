import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { getSessionServices } from '@/shared/auth/default-session-services';
import { buildAuthenticatedLoginResponse } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { MfaChallengeScreen } from './MfaChallengeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('@/shared/auth/default-session-services', () => ({ getSessionServices: jest.fn() }));

const startSession = jest.fn();

describe('MfaChallengeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    startSession.mockReset().mockResolvedValue(undefined);
    jest.mocked(getSessionServices).mockReturnValue({ startSession } as never);
    act(() => {
      useAuthFlowStore.setState({ mfaChallengeToken: 'mfa-challenge-token' });
    });
  });

  it('goes back to the login when there is no pending challenge', () => {
    act(() => {
      useAuthFlowStore.setState({ mfaChallengeToken: null });
    });
    renderScreen(<MfaChallengeScreen />);

    expect(screen.getByText('redirect:/(auth)/login')).toBeOnTheScreen();
  });

  it('verifies the app code with the challenge token and opens the session', async () => {
    mockApi({ 'POST /v1/auth/mfa/verify': buildAuthenticatedLoginResponse() });
    renderScreen(<MfaChallengeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123456');
    fireEvent.press(screen.getByRole('button', { name: 'Verificar' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/');
    });
    expect(findApiCall('POST', '/v1/auth/mfa/verify')?.body).toEqual({
      mfaToken: 'mfa-challenge-token',
      code: '123456',
      deviceName: 'iPhone · app',
    });
    expect(useAuthFlowStore.getState().mfaChallengeToken).toBeNull();
  });

  it('switches to a recovery code and sends it instead of the app code', async () => {
    mockApi({ 'POST /v1/auth/mfa/verify': buildAuthenticatedLoginResponse() });
    renderScreen(<MfaChallengeScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Usar un código de recuperación' }));
    fireEvent.changeText(screen.getByLabelText('Código de recuperación'), 'abcd-efgh-ijkl');
    fireEvent.press(screen.getByRole('button', { name: 'Verificar' }));

    await waitFor(() => {
      expect(findApiCall('POST', '/v1/auth/mfa/verify')?.body).toEqual({
        mfaToken: 'mfa-challenge-token',
        recoveryCode: 'abcd-efgh-ijkl',
        deviceName: 'iPhone · app',
      });
    });
  });

  it('shows the server message when the code is wrong', async () => {
    mockApi({
      'POST /v1/auth/mfa/verify': () => {
        throw buildApiError('VERIFICATION_CODE_INVALID', 400);
      },
    });
    renderScreen(<MfaChallengeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '000000');
    fireEvent.press(screen.getByRole('button', { name: 'Verificar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El código no es válido o ha caducado',
    );
    expect(startSession).not.toHaveBeenCalled();
  });

  it('rejects a short code without calling the API', async () => {
    mockApi({});
    renderScreen(<MfaChallengeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), '123');
    fireEvent.press(screen.getByRole('button', { name: 'Verificar' }));

    expect(await screen.findByText('El código tiene 6 dígitos')).toBeOnTheScreen();
    expect(findApiCall('POST', '/v1/auth/mfa/verify')).toBeUndefined();
  });
});
