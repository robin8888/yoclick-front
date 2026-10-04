import { QueryClient } from '@tanstack/react-query';

import { ApiError, NetworkError } from '@/shared/api/api-error';
import { createIdempotencyIntention } from '@/shared/api/idempotency';
import type { SecureStorage } from '@/shared/storage/secure';
import {
  createFakeFetch,
  type FakeFetch,
  type FakeReply,
  type FakeRoute,
  type RecordedRequest,
} from '@/test/fake-fetch';

import { useSessionStore } from './session-store';
import { createSessionServices, type SessionServices } from './session-services';

const BASE_URL = 'https://api.yoclick.test';
const CENTER_ID = '0192f4a0-0000-7000-8000-000000000001';
const EXPIRED_ACCESS_TOKEN = 'expired-access-token';
const FRESH_ACCESS_TOKEN = 'fresh-access-token';
const OLD_REFRESH_TOKEN = 'old-refresh-token';
const NEW_REFRESH_TOKEN = 'new-refresh-token';
const CONCURRENT_REQUEST_COUNT = 5;
const SESSION_USER = { id: 'user-1', email: 'marta@example.com', fullName: 'Marta Gil' };

const SESSION_INVALID_REPLY: FakeReply = {
  status: 401,
  body: {
    type: 'about:blank',
    title: 'Sesión',
    status: 401,
    code: 'SESSION_INVALID',
    traceId: 't',
  },
};

function createRefreshReply(): FakeReply {
  return {
    status: 200,
    body: {
      accessToken: FRESH_ACCESS_TOKEN,
      accessTokenExpiresAt: '2026-10-04T10:10:00.000Z',
      refreshToken: NEW_REFRESH_TOKEN,
      refreshTokenExpiresAt: '2026-11-03T10:00:00.000Z',
    },
  };
}

function createInMemorySecureStorage(initialRefreshToken: string | null): SecureStorage & {
  readonly storedRefreshToken: () => string | null;
} {
  let storedRefreshToken = initialRefreshToken;
  return {
    storedRefreshToken: () => storedRefreshToken,
    saveRefreshToken: (refreshToken) => {
      storedRefreshToken = refreshToken;
      return Promise.resolve();
    },
    readRefreshToken: () => Promise.resolve(storedRefreshToken),
    clear: () => {
      storedRefreshToken = null;
      return Promise.resolve();
    },
  };
}

// Responde 401 a cualquier token que no sea el renovado, como haría la API con un JWT caducado.
const protectedRoute: FakeRoute = (request: RecordedRequest) =>
  request.headers.get('Authorization') === `Bearer ${FRESH_ACCESS_TOKEN}`
    ? { status: 200, body: { ok: true } }
    : SESSION_INVALID_REPLY;

interface Harness {
  services: SessionServices;
  fakeFetch: FakeFetch;
  secureStorage: ReturnType<typeof createInMemorySecureStorage>;
  queryClient: QueryClient;
}

function createHarness(
  routes: Record<string, FakeRoute>,
  refreshToken = OLD_REFRESH_TOKEN,
): Harness {
  const fakeFetch = createFakeFetch(routes);
  const secureStorage = createInMemorySecureStorage(refreshToken);
  const queryClient = new QueryClient();
  const services = createSessionServices({
    baseUrl: BASE_URL,
    timeoutMs: 5000,
    secureStorage,
    queryClient,
    fetchImplementation: fakeFetch.fetchImplementation,
  });
  return { services, fakeFetch, secureStorage, queryClient };
}

function signInWithExpiredAccessToken(): void {
  useSessionStore
    .getState()
    .startSession({ accessToken: EXPIRED_ACCESS_TOKEN, user: SESSION_USER });
  useSessionStore.getState().selectActiveCenter(CENTER_ID);
}

beforeEach(() => {
  useSessionStore.getState().resetSession();
});

describe('single-flight refresh', () => {
  it('sends exactly one refresh for 5 concurrent 401s and retries every request with the new token', async () => {
    const { services, fakeFetch } = createHarness({
      '/v1/bookings': protectedRoute,
      '/v1/auth/refresh': createRefreshReply,
    });
    signInWithExpiredAccessToken();

    const results = await Promise.all(
      Array.from({ length: CONCURRENT_REQUEST_COUNT }, () =>
        services.apiClient.request<{ ok: boolean }>('/v1/bookings', { method: 'GET' }),
      ),
    );

    expect(fakeFetch.requestsTo('/v1/auth/refresh')).toHaveLength(1);
    expect(fakeFetch.requestsTo('/v1/auth/refresh')[0]?.body).toEqual({
      refreshToken: OLD_REFRESH_TOKEN,
    });
    expect(results).toEqual(Array.from({ length: CONCURRENT_REQUEST_COUNT }, () => ({ ok: true })));
    expect(fakeFetch.requestsTo('/v1/bookings')).toHaveLength(CONCURRENT_REQUEST_COUNT * 2);
  });

  it('keeps the rotated refresh token in secure storage and the access token only in memory', async () => {
    const { services, secureStorage } = createHarness({
      '/v1/bookings': protectedRoute,
      '/v1/auth/refresh': createRefreshReply,
    });
    signInWithExpiredAccessToken();

    await services.apiClient.request('/v1/bookings', { method: 'GET' });

    expect(secureStorage.storedRefreshToken()).toBe(NEW_REFRESH_TOKEN);
    expect(useSessionStore.getState().accessToken).toBe(FRESH_ACCESS_TOKEN);
  });

  it('does not refresh again when a late 401 arrives after another request already renewed the token', async () => {
    let releaseLateResponse: () => void = () => undefined;
    const lateResponseGate = new Promise<void>((resolve) => {
      releaseLateResponse = resolve;
    });
    let isFirstCall = true;
    const { services, fakeFetch } = createHarness({
      '/v1/slow': (request) => {
        const isLateRequest = isFirstCall;
        isFirstCall = false;
        if (isLateRequest) return { ...SESSION_INVALID_REPLY, delayUntil: lateResponseGate };
        return protectedRoute(request);
      },
      '/v1/fast': protectedRoute,
      '/v1/auth/refresh': createRefreshReply,
    });
    signInWithExpiredAccessToken();

    const lateRequest = services.apiClient.request('/v1/slow', { method: 'GET' });
    await services.apiClient.request('/v1/fast', { method: 'GET' });
    releaseLateResponse();
    await lateRequest;

    expect(fakeFetch.requestsTo('/v1/auth/refresh')).toHaveLength(1);
  });
});

describe('session loss', () => {
  it('signs the user out when the refresh token is rejected', async () => {
    const { services, secureStorage, queryClient } = createHarness({
      '/v1/bookings': () => SESSION_INVALID_REPLY,
      '/v1/auth/refresh': () => SESSION_INVALID_REPLY,
    });
    signInWithExpiredAccessToken();
    queryClient.setQueryData(['bookings', CENTER_ID], ['private booking']);

    const failure = await services.apiClient
      .request('/v1/bookings', { method: 'GET' })
      .catch((caught: unknown) => caught);

    expect(failure).toMatchObject({ code: 'SESSION_INVALID', status: 401 });
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      accessToken: null,
      user: null,
      activeCenterId: null,
    });
    expect(secureStorage.storedRefreshToken()).toBeNull();
    expect(queryClient.getQueryData(['bookings', CENTER_ID])).toBeUndefined();
  });

  it('keeps the session when the refresh fails because there is no connection', async () => {
    const { services, secureStorage } = createHarness({
      '/v1/bookings': () => SESSION_INVALID_REPLY,
      '/v1/auth/refresh': () => {
        throw new TypeError('Network request failed');
      },
    });
    signInWithExpiredAccessToken();

    await expect(
      services.apiClient.request('/v1/bookings', { method: 'GET' }),
    ).rejects.toBeInstanceOf(NetworkError);

    expect(useSessionStore.getState().status).toBe('signedIn');
    expect(secureStorage.storedRefreshToken()).toBe(OLD_REFRESH_TOKEN);
  });

  it('does not sign out when the refresh response does not match the contract', async () => {
    const { services } = createHarness({
      '/v1/bookings': () => SESSION_INVALID_REPLY,
      '/v1/auth/refresh': () => ({ status: 200, body: { accessToken: 42 } }),
    });
    signInWithExpiredAccessToken();

    await expect(services.apiClient.request('/v1/bookings', { method: 'GET' })).rejects.toThrow();

    expect(useSessionStore.getState().status).toBe('signedIn');
  });

  it('does not try to refresh when a login attempt returns 401', async () => {
    const { services, fakeFetch } = createHarness({
      '/v1/auth/login': () => ({
        status: 401,
        body: { code: 'INVALID_CREDENTIALS', traceId: 't', title: 'x', type: 'x', status: 401 },
      }),
    });

    const failure = await services.apiClient
      .request('/v1/auth/login', { method: 'POST', body: '{}' })
      .catch((caught: unknown) => caught);

    expect(failure).toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(fakeFetch.requests).toHaveLength(1);
    expect(fakeFetch.requests[0]?.headers.has('Authorization')).toBe(false);
  });
});

describe('request headers', () => {
  it('adds Authorization and X-Center-Id to center routes', async () => {
    const { services, fakeFetch } = createHarness({
      '/v1/bookings': () => ({ status: 200, body: {} }),
    });
    signInWithExpiredAccessToken();

    await services.apiClient.request('/v1/bookings', { method: 'GET' });

    const sentHeaders = fakeFetch.requests[0]?.headers;
    expect(sentHeaders?.get('Authorization')).toBe(`Bearer ${EXPIRED_ACCESS_TOKEN}`);
    expect(sentHeaders?.get('X-Center-Id')).toBe(CENTER_ID);
  });

  it.each(['/v1/me', '/v1/me/consents', '/v1/join/code/NORTE7'])(
    'does not send X-Center-Id to %s',
    async (path) => {
      const { services, fakeFetch } = createHarness({ [path]: () => ({ status: 200, body: {} }) });
      signInWithExpiredAccessToken();

      await services.apiClient.request(path, { method: 'GET' });

      expect(fakeFetch.requests[0]?.headers.has('X-Center-Id')).toBe(false);
    },
  );

  it('does not send credentials to /health', async () => {
    const { services, fakeFetch } = createHarness({ '/health': () => ({ status: 200, body: {} }) });
    signInWithExpiredAccessToken();

    await services.apiClient.request('/health', { method: 'GET' });

    expect(fakeFetch.requests[0]?.headers.has('Authorization')).toBe(false);
  });
});

describe('idempotency', () => {
  it('reuses the same Idempotency-Key when the request is replayed after a refresh', async () => {
    const { services, fakeFetch } = createHarness({
      '/v1/bookings': protectedRoute,
      '/v1/auth/refresh': createRefreshReply,
    });
    signInWithExpiredAccessToken();
    const intention = createIdempotencyIntention(() => 'key-booking-1');

    await services.apiClient.request('/v1/bookings', {
      method: 'POST',
      headers: intention.headers,
      body: '{}',
    });

    const sentKeys = fakeFetch
      .requestsTo('/v1/bookings')
      .map((request) => request.headers.get('Idempotency-Key'));
    expect(sentKeys).toEqual(['key-booking-1', 'key-booking-1']);
  });

  it('reuses the key when the user retries the same intention and changes it for a new one', () => {
    let generatedKeyCount = 0;
    const generateKey = (): string => `key-${String(++generatedKeyCount)}`;

    const firstIntention = createIdempotencyIntention(generateKey);
    const retryOfFirstIntention = firstIntention;
    const secondIntention = createIdempotencyIntention(generateKey);

    expect(retryOfFirstIntention.headers['Idempotency-Key']).toBe('key-1');
    expect(secondIntention.headers['Idempotency-Key']).toBe('key-2');
  });
});

describe('session lifecycle', () => {
  it('startSession stores the refresh token securely and the access token in memory', async () => {
    const { services, secureStorage } = createHarness({}, 'unused');

    await services.startSession({
      accessToken: FRESH_ACCESS_TOKEN,
      refreshToken: NEW_REFRESH_TOKEN,
      user: SESSION_USER,
    });

    expect(secureStorage.storedRefreshToken()).toBe(NEW_REFRESH_TOKEN);
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedIn',
      accessToken: FRESH_ACCESS_TOKEN,
      user: SESSION_USER,
    });
  });

  it('restoreSession exchanges the stored refresh token for an access token', async () => {
    const { services } = createHarness({ '/v1/auth/refresh': createRefreshReply });

    await services.restoreSession();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedIn',
      accessToken: FRESH_ACCESS_TOKEN,
    });
  });

  it('restoreSession leaves the user signed out when there is no stored refresh token', async () => {
    const { services, fakeFetch } = createHarness({}, null as unknown as string);

    await services.restoreSession();

    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(fakeFetch.requests).toHaveLength(0);
  });

  it('signOut revokes the refresh token on the server and clears everything locally', async () => {
    const { services, fakeFetch, secureStorage, queryClient } = createHarness({
      '/v1/auth/logout': () => ({ status: 204 }),
    });
    await services.startSession({
      accessToken: FRESH_ACCESS_TOKEN,
      refreshToken: OLD_REFRESH_TOKEN,
      user: SESSION_USER,
    });
    queryClient.setQueryData(['me'], SESSION_USER);

    await services.signOut({ shouldRevokeEverywhere: true });

    expect(fakeFetch.requestsTo('/v1/auth/logout')[0]?.body).toEqual({
      refreshToken: OLD_REFRESH_TOKEN,
      everywhere: true,
    });
    expect(secureStorage.storedRefreshToken()).toBeNull();
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('signOut still clears the device when the server cannot be reached', async () => {
    const { services, secureStorage } = createHarness({
      '/v1/auth/logout': () => {
        throw new TypeError('Network request failed');
      },
    });
    await services.startSession({
      accessToken: FRESH_ACCESS_TOKEN,
      refreshToken: OLD_REFRESH_TOKEN,
      user: SESSION_USER,
    });

    await services.signOut();

    expect(secureStorage.storedRefreshToken()).toBeNull();
    expect(useSessionStore.getState().accessToken).toBeNull();
  });
});

describe('logging', () => {
  it('never writes tokens or bodies to the console during a refresh and a failure', async () => {
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      jest.spyOn(console, method).mockImplementation(() => undefined),
    );
    const { services } = createHarness({
      '/v1/bookings': protectedRoute,
      '/v1/auth/refresh': createRefreshReply,
      '/v1/fail': () => ({
        status: 409,
        body: { code: 'SLOT_UNAVAILABLE', traceId: 't', title: 'x', type: 'x', status: 409 },
      }),
    });
    signInWithExpiredAccessToken();

    await services.apiClient.request('/v1/bookings', { method: 'GET' });
    const failure = await services.apiClient
      .request('/v1/fail', { method: 'POST', body: JSON.stringify({ note: 'dato privado' }) })
      .catch((caught: unknown) => caught);

    const loggedText = JSON.stringify(consoleSpies.flatMap((spy) => spy.mock.calls));
    expect(loggedText).not.toContain(FRESH_ACCESS_TOKEN);
    expect(loggedText).not.toContain(NEW_REFRESH_TOKEN);
    expect(loggedText).not.toContain(OLD_REFRESH_TOKEN);
    expect(consoleSpies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
    expect(failure).toBeInstanceOf(ApiError);
    expect(String((failure as ApiError).stack)).not.toContain('dato privado');
    consoleSpies.forEach((spy) => {
      spy.mockRestore();
    });
  });
});
