import { buildExpoConfig } from './build-expo-config.ts';
import { parseBuildEnvironment } from './parse-build-environment.ts';

const PRODUCTION_ENV = { APP_ENV: 'production', API_URL: 'https://api.yoclick.app' };

describe('buildExpoConfig', () => {
  it('uses the placeholder identifiers and the yoclick scheme in production', () => {
    const config = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(config.name).toBe('Yoclick');
    expect(config.scheme).toBe('yoclick');
    expect(config.ios?.bundleIdentifier).toBe('com.yoclick.app');
    expect(config.android?.package).toBe('com.yoclick.app');
    expect(config.extra).toEqual({
      appEnvironment: 'production',
      apiUrl: PRODUCTION_ENV.API_URL,
      eas: { projectId: 'b1d194fb-d580-45f0-8266-b0e1c7965f54' },
      legalUrls: {
        privacyPolicy: 'https://yoclick.app/privacidad',
        termsOfService: 'https://yoclick.app/condiciones',
      },
      supportEmail: 'soporte@yoclick.app',
    });
  });

  it('lets dev and preview builds coexist with production', () => {
    const developmentConfig = buildExpoConfig(parseBuildEnvironment({ APP_ENV: 'development' }));
    const previewConfig = buildExpoConfig(
      parseBuildEnvironment({ APP_ENV: 'preview', API_URL: 'https://staging.example.com' }),
    );

    expect(developmentConfig.ios?.bundleIdentifier).toBe('com.yoclick.app.dev');
    expect(developmentConfig.scheme).toBe('yoclick-development');
    expect(previewConfig.android?.package).toBe('com.yoclick.app.preview');
    expect(previewConfig.name).toBe('Yoclick (Preview)');
  });

  it('configures universal links for iOS and Android', () => {
    const config = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(config.ios?.associatedDomains).toEqual(['applinks:yoclick.app']);
    expect(config.android?.intentFilters?.[0]).toMatchObject({
      action: 'VIEW',
      autoVerify: true,
      data: [
        { scheme: 'https', host: 'yoclick.app', pathPrefix: '/j/' },
        { scheme: 'https', host: 'yoclick.app', pathPrefix: '/i/' },
      ],
    });
  });

  it('hardens Android and iOS security settings (SEC-30)', () => {
    const config = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(config.android?.allowBackup).toBe(false);
    expect(config.plugins).toContainEqual([
      'expo-build-properties',
      { android: { usesCleartextTraffic: false } },
    ]);
    expect(config.ios?.infoPlist).toMatchObject({
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: { NSAllowsArbitraryLoads: false },
    });
  });

  it('configures the camera for QR scanning only, without microphone', () => {
    const { plugins } = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(plugins).toContainEqual([
      'expo-camera',
      expect.objectContaining({ microphonePermission: false, recordAudioAndroid: false }),
    ]);
  });

  it('asks for the location only while the app is open, never in the background', () => {
    const { plugins } = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(plugins).toContainEqual([
      'expo-location',
      { locationWhenInUsePermission: expect.stringMatching(/ubicación/) as string },
    ]);
  });

  it('plays videos only while the app is open', () => {
    const { plugins } = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(plugins).toContainEqual([
      'expo-video',
      { supportsBackgroundPlayback: false, supportsPictureInPicture: false },
    ]);
  });

  it('declares Spanish permission usage strings', () => {
    const infoPlist = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV)).ios?.infoPlist;

    expect(infoPlist?.NSCameraUsageDescription).toMatch(/cámara/);
    expect(infoPlist?.NSLocationWhenInUseUsageDescription).toMatch(/ubicación/);
  });

  it('includes the dev client only in development builds (SEC-32)', () => {
    const developmentPlugins = buildExpoConfig(parseBuildEnvironment({})).plugins;
    const productionPlugins = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV)).plugins;

    expect(developmentPlugins).toContain('expo-dev-client');
    expect(productionPlugins).not.toContain('expo-dev-client');
  });

  it('publishes the legal texts over HTTPS so the app can link them', () => {
    const config = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(config.extra?.legalUrls).toEqual({
      privacyPolicy: 'https://yoclick.app/privacidad',
      termsOfService: 'https://yoclick.app/condiciones',
    });
  });
});

describe('buildExpoConfig (updates)', () => {
  it('uses a fingerprint runtime version and the yoclick update channel URL for the shared app', () => {
    const config = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(config.runtimeVersion).toEqual({ policy: 'fingerprint' });
    expect(config.updates).toEqual({
      url: 'https://u.expo.dev/b1d194fb-d580-45f0-8266-b0e1c7965f54',
    });
  });
});
