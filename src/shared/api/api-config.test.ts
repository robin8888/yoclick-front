/* eslint-disable sonarjs/no-clear-text-protocols -- la API local de desarrollo va por http a propósito */
import { resolveApiBaseUrl } from './api-config';

describe('resolveApiBaseUrl', () => {
  it('prefers the app config extra over the environment variable', () => {
    expect(
      resolveApiBaseUrl({
        extraApiUrl: 'https://api.yoclick.app',
        environmentApiUrl: 'https://other.example.com',
        isDevelopmentBuild: false,
      }),
    ).toBe('https://api.yoclick.app');
  });

  it('falls back to EXPO_PUBLIC_API_URL when the extra is missing', () => {
    expect(
      resolveApiBaseUrl({
        environmentApiUrl: 'https://staging.yoclick.app',
        isDevelopmentBuild: false,
      }),
    ).toBe('https://staging.yoclick.app');
  });

  it('keeps only the origin so paths can be appended', () => {
    expect(
      resolveApiBaseUrl({ extraApiUrl: 'https://api.yoclick.app/', isDevelopmentBuild: false }),
    ).toBe('https://api.yoclick.app');
  });

  it('allows plain http only in development builds', () => {
    expect(
      resolveApiBaseUrl({ extraApiUrl: 'http://localhost:3000', isDevelopmentBuild: true }),
    ).toBe('http://localhost:3000');
    expect(() =>
      resolveApiBaseUrl({ extraApiUrl: 'http://localhost:3000', isDevelopmentBuild: false }),
    ).toThrow();
  });

  it.each([
    ['http://localhost:3000', '192.168.0.103:8081', 'http://192.168.0.103:3000'],
    ['http://127.0.0.1:3000', '192.168.0.103:8081', 'http://192.168.0.103:3000'],
    ['http://192.168.0.50:3000', '192.168.0.103:8081', 'http://192.168.0.103:3000'],
    ['https://api-staging.yoclick.app', '192.168.0.103:8081', 'https://api-staging.yoclick.app'],
    ['http://localhost:3000', undefined, 'http://localhost:3000'],
  ])(
    'in development, %s with the dev server at %s becomes %s',
    (extraApiUrl, devServerHostUri, expectedUrl) => {
      expect(resolveApiBaseUrl({ extraApiUrl, devServerHostUri, isDevelopmentBuild: true })).toBe(
        expectedUrl,
      );
    },
  );

  it('never rewrites the host outside development builds', () => {
    expect(
      resolveApiBaseUrl({
        extraApiUrl: 'https://api.yoclick.app',
        devServerHostUri: '192.168.0.103:8081',
        isDevelopmentBuild: false,
      }),
    ).toBe('https://api.yoclick.app');
  });

  it.each([undefined, '', 'not-a-url', 'file:///api.yoclick.app'])('rejects %s', (invalidUrl) => {
    expect(() =>
      resolveApiBaseUrl({ extraApiUrl: invalidUrl, isDevelopmentBuild: true }),
    ).toThrow();
  });
});
