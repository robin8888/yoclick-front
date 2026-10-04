import { ApiError, NetworkError } from '@/shared/api/api-error';

import { createSessionRefresher, type SessionRefresherDependencies } from './refresh-session';

type MockedDependencies = {
  [Name in keyof SessionRefresherDependencies]: jest.Mock<
    ReturnType<SessionRefresherDependencies[Name]>,
    Parameters<SessionRefresherDependencies[Name]>
  >;
};

function createDependencies(
  overrides: Partial<SessionRefresherDependencies> = {},
): MockedDependencies {
  return {
    readRefreshToken: jest.fn(overrides.readRefreshToken ?? (() => Promise.resolve('refresh-1'))),
    requestRotatedTokens: jest.fn(
      overrides.requestRotatedTokens ??
        (() => Promise.resolve({ accessToken: 'access-2', refreshToken: 'refresh-2' })),
    ),
    saveRefreshToken: jest.fn(overrides.saveRefreshToken ?? (() => Promise.resolve())),
    applyAccessToken: jest.fn(overrides.applyAccessToken ?? (() => undefined)),
    onSessionRejected: jest.fn(overrides.onSessionRejected ?? (() => Promise.resolve())),
  };
}

describe('createSessionRefresher', () => {
  it('rotates the tokens, stores the new refresh token and keeps the access token in memory', async () => {
    const dependencies = createDependencies();

    const accessToken = await createSessionRefresher(dependencies).refreshAccessToken();

    expect(accessToken).toBe('access-2');
    expect(dependencies.requestRotatedTokens).toHaveBeenCalledWith('refresh-1');
    expect(dependencies.saveRefreshToken).toHaveBeenCalledWith('refresh-2');
    expect(dependencies.applyAccessToken).toHaveBeenCalledWith('access-2');
  });

  it('sends exactly one refresh request for concurrent callers (single-flight)', async () => {
    const dependencies = createDependencies();
    const { refreshAccessToken } = createSessionRefresher(dependencies);

    const results = await Promise.all(Array.from({ length: 5 }, () => refreshAccessToken()));

    expect(dependencies.requestRotatedTokens).toHaveBeenCalledTimes(1);
    expect(results).toEqual(Array.from({ length: 5 }, () => 'access-2'));
  });

  it('allows a new refresh once the previous one has finished', async () => {
    const dependencies = createDependencies();
    const { refreshAccessToken } = createSessionRefresher(dependencies);

    await refreshAccessToken();
    await refreshAccessToken();

    expect(dependencies.requestRotatedTokens).toHaveBeenCalledTimes(2);
  });

  it('signs out when there is no refresh token stored', async () => {
    const dependencies = createDependencies({ readRefreshToken: () => Promise.resolve(null) });

    const accessToken = await createSessionRefresher(dependencies).refreshAccessToken();

    expect(accessToken).toBeNull();
    expect(dependencies.requestRotatedTokens).not.toHaveBeenCalled();
    expect(dependencies.onSessionRejected).toHaveBeenCalledTimes(1);
  });

  it.each([400, 401, 403])(
    'signs out when the server rejects the refresh token with %i',
    async (status) => {
      const dependencies = createDependencies({
        requestRotatedTokens: () =>
          Promise.reject(new ApiError({ code: 'SESSION_INVALID', status })),
      });

      const accessToken = await createSessionRefresher(dependencies).refreshAccessToken();

      expect(accessToken).toBeNull();
      expect(dependencies.onSessionRejected).toHaveBeenCalledTimes(1);
      expect(dependencies.saveRefreshToken).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['a network failure', new NetworkError('offline')],
    ['a server error', new ApiError({ code: 'INTERNAL_ERROR', status: 503 })],
    ['a rate limit', new ApiError({ code: 'RATE_LIMITED', status: 429 })],
    ['a request timeout', new ApiError({ code: 'TIMEOUT', status: 408 })],
  ])('keeps the session and rethrows on %s', async (_label, transientFailure) => {
    const dependencies = createDependencies({
      requestRotatedTokens: () => Promise.reject(transientFailure),
    });

    await expect(createSessionRefresher(dependencies).refreshAccessToken()).rejects.toBe(
      transientFailure,
    );

    expect(dependencies.onSessionRejected).not.toHaveBeenCalled();
  });

  it('lets every concurrent caller see the same rejection and then recovers', async () => {
    let shouldFail = true;
    const dependencies = createDependencies({
      requestRotatedTokens: () =>
        shouldFail
          ? Promise.reject(new NetworkError('offline'))
          : Promise.resolve({ accessToken: 'access-3', refreshToken: 'refresh-3' }),
    });
    const { refreshAccessToken } = createSessionRefresher(dependencies);

    const failures = await Promise.allSettled([refreshAccessToken(), refreshAccessToken()]);
    shouldFail = false;

    expect(failures.map((failure) => failure.status)).toEqual(['rejected', 'rejected']);
    await expect(refreshAccessToken()).resolves.toBe('access-3');
  });
});
