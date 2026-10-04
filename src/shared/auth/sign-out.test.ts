import { createLocalSignOut } from './sign-out';

describe('createLocalSignOut', () => {
  it('clears the secure storage, the query cache and the in-memory session', async () => {
    const callOrder: string[] = [];
    const signOutLocally = createLocalSignOut({
      secureStorage: {
        clear: () => {
          callOrder.push('secure.clear');
          return Promise.resolve();
        },
      },
      queryClient: {
        clear: () => {
          callOrder.push('queryClient.clear');
        },
      },
      resetSession: () => {
        callOrder.push('resetSession');
      },
    });

    await signOutLocally();

    expect(callOrder).toEqual(['resetSession', 'queryClient.clear', 'secure.clear']);
  });

  it('drops the in-memory session even when SecureStore fails to delete', async () => {
    const resetSession = jest.fn();
    const signOutLocally = createLocalSignOut({
      secureStorage: { clear: () => Promise.reject(new Error('keychain unavailable')) },
      queryClient: { clear: jest.fn() },
      resetSession,
    });

    await expect(signOutLocally()).rejects.toThrow('keychain unavailable');

    expect(resetSession).toHaveBeenCalledTimes(1);
  });
});
