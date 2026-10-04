import { buildExpoConfig } from './build-expo-config.ts';
import { parseBuildEnvironment } from './parse-build-environment.ts';

const PREMIUM_ENV = {
  APP_VARIANT: 'premium',
  CENTER_SLUG: 'studio-norte',
  CENTER_NAME: 'Studio Norte',
  CENTER_ID: '0b8f1c2e-6a3d-4f5e-9c7b-1d2e3f4a5b6c',
};
const PRODUCTION_ENV = { APP_ENV: 'production', API_URL: 'https://api.yoclick.app' };

describe('buildExpoConfig (shared variant)', () => {
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

  it('does not lock the app to a center', () => {
    const config = buildExpoConfig(parseBuildEnvironment(PRODUCTION_ENV));

    expect(config.extra).not.toHaveProperty('lockedCenterId');
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

  it('disables OTA updates for premium apps until they have their own EAS project', () => {
    const config = buildExpoConfig(parseBuildEnvironment({ ...PRODUCTION_ENV, ...PREMIUM_ENV }));

    expect(config.updates).toEqual({ enabled: false });
  });
});

describe('buildExpoConfig (premium variant)', () => {
  it('takes name, slug, identifiers and locked center from the center', () => {
    const config = buildExpoConfig(parseBuildEnvironment({ ...PRODUCTION_ENV, ...PREMIUM_ENV }));

    expect(config.name).toBe('Studio Norte');
    expect(config.slug).toBe('studio-norte');
    expect(config.scheme).toBe('yoclick-studio-norte');
    expect(config.ios?.bundleIdentifier).toBe('com.yoclick.center.studionorte');
    expect(config.android?.package).toBe('com.yoclick.center.studionorte');
    expect(config.icon).toBe('./assets/centers/studio-norte/icon.png');
    expect(config.extra).toMatchObject({ lockedCenterId: PREMIUM_ENV.CENTER_ID });
  });

  it('prefixes package segments that would start with a digit', () => {
    const config = buildExpoConfig(
      parseBuildEnvironment({ ...PRODUCTION_ENV, ...PREMIUM_ENV, CENTER_SLUG: '24-fit' }),
    );

    expect(config.android?.package).toBe('com.yoclick.center.c24fit');
  });
});
