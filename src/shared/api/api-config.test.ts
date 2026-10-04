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

  it.each([undefined, '', 'not-a-url', 'file:///api.yoclick.app'])('rejects %s', (invalidUrl) => {
    expect(() =>
      resolveApiBaseUrl({ extraApiUrl: invalidUrl, isDevelopmentBuild: true }),
    ).toThrow();
  });
});
