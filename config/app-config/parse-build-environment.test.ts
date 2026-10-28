import { AppConfigError, parseBuildEnvironment } from './parse-build-environment.ts';

describe('parseBuildEnvironment', () => {
  it('defaults to a shared development build against the local API', () => {
    const buildEnvironment = parseBuildEnvironment({});

    expect(buildEnvironment).toEqual({
      appEnvironment: 'development',
      apiUrl: 'http://localhost:3000',
    });
  });

  it('accepts the production API URL and strips the trailing slash', () => {
    const buildEnvironment = parseBuildEnvironment({
      APP_ENV: 'production',
      API_URL: 'https://api.yoclick.app/',
    });

    expect(buildEnvironment.apiUrl).toBe('https://api.yoclick.app');
  });

  it.each([
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- caso negativo: http debe rechazarse
    ['http scheme', 'http://api.yoclick.app'],
    ['staging host', 'https://api-staging.yoclick.app'],
    ['lookalike host', 'https://api.yoclick.app.evil.com'],
    ['credentials in url', 'https://user:pass@api.yoclick.app'],
    ['extra path', 'https://api.yoclick.app/v1'],
    ['not a url', 'api.yoclick.app'],
  ])('fails a production build when the API URL has %s (SEC-31)', (_label, apiUrl) => {
    expect(() => parseBuildEnvironment({ APP_ENV: 'production', API_URL: apiUrl })).toThrow(
      AppConfigError,
    );
  });

  it('fails a production build when API_URL is missing', () => {
    expect(() => parseBuildEnvironment({ APP_ENV: 'production' })).toThrow(AppConfigError);
  });

  it('requires https for preview builds', () => {
    expect(() =>
      parseBuildEnvironment({ APP_ENV: 'preview', API_URL: 'http://staging.example.com' }),
    ).toThrow(AppConfigError);
    expect(
      parseBuildEnvironment({ APP_ENV: 'preview', API_URL: 'https://staging.example.com' }).apiUrl,
    ).toBe('https://staging.example.com');
  });

  it('rejects an unknown APP_ENV instead of silently falling back', () => {
    expect(() => parseBuildEnvironment({ APP_ENV: 'prod' })).toThrow(AppConfigError);
  });
});
