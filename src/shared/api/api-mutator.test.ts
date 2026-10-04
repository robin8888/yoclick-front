import { QueryClient } from '@tanstack/react-query';

import { createSessionServices, type SessionServices } from '@/shared/auth/session-services';
import { createFakeFetch } from '@/test/fake-fetch';

import { ApiError } from './api-error';
import { authLogin } from './generated/endpoints/auth/auth';

const fakeFetch = createFakeFetch({
  '/v1/auth/login': (request) =>
    (request.body as { password: string }).password === 'correct-password'
      ? { status: 200, body: { accessToken: 'jwt', user: { id: 'u1' } } }
      : {
          status: 401,
          body: { type: 'x', title: 'x', status: 401, code: 'INVALID_CREDENTIALS', traceId: 't' },
        },
});

// jest.mock se eleva sobre los imports: solo puede usar variables con prefijo `mock`, evaluadas al llamar.
const mockCreateServices = (): SessionServices =>
  createSessionServices({
    baseUrl: 'https://api.yoclick.test',
    timeoutMs: 5000,
    secureStorage: {
      saveRefreshToken: () => Promise.resolve(),
      readRefreshToken: () => Promise.resolve(null),
      clear: () => Promise.resolve(),
    },
    queryClient: new QueryClient(),
    fetchImplementation: fakeFetch.fetchImplementation,
  });

jest.mock('@/shared/auth/default-session-services', () => ({
  getSessionServices: () => mockCreateServices(),
}));

describe('generated client through apiMutator', () => {
  it('sends the typed body as JSON and resolves with the parsed response body', async () => {
    const loginResponse = await authLogin({
      email: 'marta@example.com',
      password: 'correct-password',
    });

    expect(loginResponse).toMatchObject({ accessToken: 'jwt' });
    expect(fakeFetch.requests[0]).toMatchObject({
      method: 'POST',
      body: { email: 'marta@example.com', password: 'correct-password' },
    });
    expect(fakeFetch.requests[0]?.headers.get('Content-Type')).toBe('application/json');
  });

  it('rejects with an ApiError carrying the stable problem code', async () => {
    const failure = await authLogin({ email: 'marta@example.com', password: 'wrong' }).catch(
      (caught: unknown) => caught,
    );

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401 });
  });
});
