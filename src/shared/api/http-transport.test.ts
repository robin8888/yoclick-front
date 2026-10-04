import { createFakeFetch } from '@/test/fake-fetch';

import { ApiError, NetworkError } from './api-error';
import { createHttpTransport } from './http-transport';

const BASE_URL = 'https://api.yoclick.test';
const TIMEOUT_MS = 5000;

function createHangingFetch(): typeof fetch {
  return ((_url: string, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    })) as unknown as typeof fetch;
}

describe('createHttpTransport', () => {
  it('prefixes the base URL and returns the parsed JSON body', async () => {
    const fakeFetch = createFakeFetch({
      '/health': () => ({ status: 200, body: { status: 'ok' } }),
    });
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: fakeFetch.fetchImplementation,
    });

    const response = await transport.send('/health', { method: 'GET' });

    expect(response).toMatchObject({ status: 200, body: { status: 'ok' } });
    expect(fakeFetch.requests[0]?.url).toBe(`${BASE_URL}/health`);
  });

  it('returns an undefined body for 204 responses', async () => {
    const fakeFetch = createFakeFetch({ '/v1/auth/logout': () => ({ status: 204 }) });
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: fakeFetch.fetchImplementation,
    });

    await expect(transport.send('/v1/auth/logout', { method: 'POST' })).resolves.toMatchObject({
      status: 204,
      body: undefined,
    });
  });

  it('throws an ApiError built from the problem+json body', async () => {
    const fakeFetch = createFakeFetch({
      '/v1/auth/login': () => ({
        status: 401,
        body: { code: 'INVALID_CREDENTIALS', traceId: 'trace-1' },
      }),
    });
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: fakeFetch.fetchImplementation,
    });

    const failure = await transport
      .send('/v1/auth/login', { method: 'POST' })
      .catch((caught: unknown) => caught);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401, traceId: 'trace-1' });
  });

  it('reports the minimum app version header on every response, even errors', async () => {
    const reportedVersions: string[] = [];
    const fakeFetch = createFakeFetch({
      '/v1/me': () => ({ status: 500, headers: { 'X-Min-App-Version': '1.4.0' } }),
    });
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: fakeFetch.fetchImplementation,
      onResponseHeaders: (headers) => {
        reportedVersions.push(headers.get('x-min-app-version') ?? 'missing');
      },
    });

    await expect(transport.send('/v1/me', {})).rejects.toBeInstanceOf(ApiError);

    expect(reportedVersions).toEqual(['1.4.0']);
  });

  it('maps a failed fetch to an offline NetworkError', async () => {
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: () => Promise.reject(new TypeError('Network request failed')),
    });

    await expect(transport.send('/health', {})).rejects.toMatchObject({
      name: 'NetworkError',
      reason: 'offline',
    });
  });

  it('aborts with a timeout NetworkError when the server takes too long', async () => {
    jest.useFakeTimers();
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: createHangingFetch(),
    });

    const failure = transport.send('/health', {}).catch((caught: unknown) => caught);
    await jest.advanceTimersByTimeAsync(TIMEOUT_MS);

    expect(await failure).toBeInstanceOf(NetworkError);
    expect(await failure).toMatchObject({ reason: 'timeout' });
    jest.useRealTimers();
  });

  it('rethrows the abort when the caller cancels the request', async () => {
    const callerController = new AbortController();
    const transport = createHttpTransport({
      baseUrl: BASE_URL,
      timeoutMs: TIMEOUT_MS,
      fetchImplementation: createHangingFetch(),
    });

    const failure = transport
      .send('/health', { signal: callerController.signal })
      .catch((caught: unknown) => caught);
    callerController.abort();

    expect(await failure).toMatchObject({ name: 'AbortError' });
  });
});
