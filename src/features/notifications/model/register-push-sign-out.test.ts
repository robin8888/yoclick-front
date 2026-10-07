import { runPreSignOutTasks } from '@/shared/auth/sign-out-cleanup';
import { findApiCall, mockApi } from '@/test/mock-api';

import './register-push-sign-out';
import { usePushTokenStore } from './push-token-store';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const TOKEN = 'ExponentPushToken[abcdefghijkl]';

describe('signing out', () => {
  beforeEach(() => {
    mockApi({ 'POST /v1/me/push-token/unregister': null });
  });

  it('unregisters this phone from the notices of the account before the session closes', async () => {
    usePushTokenStore.getState().setRegisteredToken(TOKEN);

    await runPreSignOutTasks();

    expect(findApiCall('POST', '/v1/me/push-token/unregister')?.body).toEqual({ token: TOKEN });
    expect(usePushTokenStore.getState().registeredToken).toBeNull();
  });

  it('does nothing when the phone was never registered', async () => {
    usePushTokenStore.getState().setRegisteredToken(null);

    await runPreSignOutTasks();

    expect(findApiCall('POST', '/v1/me/push-token/unregister')).toBeUndefined();
  });

  it('does not block the sign out when the server cannot be reached', async () => {
    mockApi({});
    usePushTokenStore.getState().setRegisteredToken(TOKEN);

    await expect(runPreSignOutTasks()).resolves.toBeUndefined();
  });
});
