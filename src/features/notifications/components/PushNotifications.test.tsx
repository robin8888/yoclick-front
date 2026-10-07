import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePushPermissionStore } from '../hooks/usePushPermission';
import { usePushTokenStore } from '../model/push-token-store';
import { PushNotificationsSetup } from './PushNotificationsSetup';
import { PushPermissionCard } from './PushPermissionCard';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
}));

const TOKEN = 'ExponentPushToken[abcdefghijkl]';
const permissions = jest.mocked(Notifications.getPermissionsAsync);
const requestPermissions = jest.mocked(Notifications.requestPermissionsAsync);
const getPushToken = jest.mocked(Notifications.getExpoPushTokenAsync);
const addResponseListener = jest.mocked(Notifications.addNotificationResponseReceivedListener);

function permissionResponse(isGranted: boolean, canAskAgain: boolean): never {
  return {
    granted: isGranted,
    canAskAgain,
    status: isGranted ? 'granted' : 'denied',
    expires: 'never',
  } as never;
}

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

function renderSetupAndCard(): void {
  renderScreen(
    <>
      <PushNotificationsSetup />
      <PushPermissionCard />
    </>,
  );
}

describe('push notifications on the phone', () => {
  beforeEach(() => {
    resetMockRouter();
    jest.clearAllMocks();
    usePushTokenStore.getState().setRegisteredToken(null);
    usePushPermissionStore.getState().setStatus('unknown');
    getPushToken.mockResolvedValue({ type: 'expo', data: TOKEN });
    addResponseListener.mockReturnValue({ remove: jest.fn() });
    mockApi({
      'GET /v1/me/memberships': {
        memberships: [
          {
            membershipId: 'm1',
            centerId: NORTE_CENTER_ID,
            role: 'client',
            center: { sectorId: 'gym' },
          },
        ],
      },
      // `null`: la API responde 204 y el mock distingue «sin respuesta» (null) de «ruta que no existe».
      'PUT /v1/me/push-token': null,
    });
    signIn();
  });

  describe('PushPermissionCard', () => {
    it('explains what the notices are for and asks for the permission when pressed', async () => {
      permissions.mockResolvedValue(permissionResponse(false, true));
      requestPermissions.mockResolvedValue(permissionResponse(true, true));
      renderSetupAndCard();

      expect(await screen.findByText('Activa los avisos')).toBeOnTheScreen();
      fireEvent.press(screen.getByRole('button', { name: 'Activar' }));

      await waitFor(() => {
        expect(requestPermissions).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.queryByText('Activa los avisos')).toBeNull();
      });
    });

    it('sends the person to the settings when the permission was denied', async () => {
      permissions.mockResolvedValue(permissionResponse(false, false));
      const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
      renderSetupAndCard();

      fireEvent.press(await screen.findByRole('button', { name: 'Ajustes' }));

      expect(openSettings).toHaveBeenCalled();
      expect(requestPermissions).not.toHaveBeenCalled();
    });

    it('is not shown when the permission is already granted', async () => {
      permissions.mockResolvedValue(permissionResponse(true, true));
      renderSetupAndCard();

      await waitFor(() => {
        expect(getPushToken).toHaveBeenCalled();
      });
      expect(screen.queryByText('Activa los avisos')).toBeNull();
    });
  });

  describe('PushNotificationsSetup', () => {
    it('registers this phone with the server once the permission is granted', async () => {
      permissions.mockResolvedValue(permissionResponse(true, true));
      renderScreen(<PushNotificationsSetup />);

      await waitFor(() => {
        const body = findApiCall('PUT', '/v1/me/push-token')?.body as {
          token: string;
          platform: string;
        };
        expect(body.token).toBe(TOKEN);
        expect(['ios', 'android']).toContain(body.platform);
      });
      await waitFor(() => {
        expect(usePushTokenStore.getState().registeredToken).toBe(TOKEN);
      });
    });

    it('does not register anything while the permission is not granted', async () => {
      permissions.mockResolvedValue(permissionResponse(false, true));
      renderScreen(<PushNotificationsSetup />);

      await waitFor(() => {
        expect(permissions).toHaveBeenCalled();
      });
      expect(getPushToken).not.toHaveBeenCalled();
      expect(findApiCall('PUT', '/v1/me/push-token')).toBeUndefined();
    });

    it('opens the notices of the client when a push is tapped', async () => {
      permissions.mockResolvedValue(permissionResponse(false, true));
      renderScreen(<PushNotificationsSetup />);
      // El rol llega con la lista de centros: cuando cambia, el aviso se vuelve a escuchar con él.
      await waitFor(() => {
        expect(addResponseListener.mock.calls.length).toBeGreaterThanOrEqual(2);
      });
      const onTap = addResponseListener.mock.calls.at(-1)?.[0];

      act(() => {
        onTap?.({} as never);
      });

      expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/notifications');
    });
  });
});
