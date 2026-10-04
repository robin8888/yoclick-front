import { AppConfigError, parseBuildEnvironment } from './parse-build-environment.ts';

const PREMIUM_ENV = {
  APP_VARIANT: 'premium',
  CENTER_SLUG: 'studio-norte',
  CENTER_NAME: 'Studio Norte',
  CENTER_ID: '0b8f1c2e-6a3d-4f5e-9c7b-1d2e3f4a5b6c',
};

describe('parseBuildEnvironment', () => {
  it('defaults to a shared development build against the local API', () => {
    const buildEnvironment = parseBuildEnvironment({});

    expect(buildEnvironment).toEqual({
      appEnvironment: 'development',
      apiUrl: 'http://localhost:3000',
      variant: { kind: 'shared' },
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

  it('parses a premium variant with center data', () => {
    const buildEnvironment = parseBuildEnvironment(PREMIUM_ENV);

    expect(buildEnvironment.variant).toEqual({
      kind: 'premium',
      centerSlug: 'studio-norte',
      centerName: 'Studio Norte',
      centerId: '0b8f1c2e-6a3d-4f5e-9c7b-1d2e3f4a5b6c',
    });
  });

  it.each(['CENTER_SLUG', 'CENTER_NAME', 'CENTER_ID'])(
    'fails a premium build without %s',
    (missingVariableName) => {
      const incompleteEnv: Record<string, string | undefined> = {
        ...PREMIUM_ENV,
        [missingVariableName]: undefined,
      };

      expect(() => parseBuildEnvironment(incompleteEnv)).toThrow(AppConfigError);
    },
  );

  it.each(['Studio Norte', 'studio_norte', '-norte', 'norte-', '../etc'])(
    'rejects the invalid center slug %s',
    (invalidSlug) => {
      expect(() => parseBuildEnvironment({ ...PREMIUM_ENV, CENTER_SLUG: invalidSlug })).toThrow(
        AppConfigError,
      );
    },
  );

  it('rejects a center id that is not a uuid', () => {
    expect(() => parseBuildEnvironment({ ...PREMIUM_ENV, CENTER_ID: '123' })).toThrow(
      AppConfigError,
    );
  });

  it('rejects an unknown APP_VARIANT', () => {
    expect(() => parseBuildEnvironment({ APP_VARIANT: 'enterprise' })).toThrow(AppConfigError);
  });
});
