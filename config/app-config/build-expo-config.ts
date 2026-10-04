import type { ExpoConfig } from 'expo/config';

import type { BuildEnvironment } from './parse-build-environment.ts';
import { resolveAppIdentity, type AppIdentity } from './resolve-app-identity.ts';

const APP_VERSION = '0.1.0';
// Id público del proyecto «yoclick» en expo.dev (no es un secreto). Cada centro Premium usa su propio proyecto.
const SHARED_EAS_PROJECT_ID = 'b1d194fb-d580-45f0-8266-b0e1c7965f54';
// Dominio de los universal links https://yoclick.app/j/{code} e /i/{token}.
// Provisional: hay que publicar apple-app-site-association y assetlinks.json en este dominio.
const UNIVERSAL_LINK_HOST = 'yoclick.app';
const UNIVERSAL_LINK_PATH_PREFIXES = ['/j/', '/i/'] as const;
const SPLASH_IMAGE_WIDTH = 200;
// Azul noche del logotipo de Yoclick: el símbolo tiene un resplandor pensado para fondo oscuro, así
// que la pantalla de carga y el fondo del icono adaptativo de Android usan el mismo color en claro y
// oscuro. La configuración nativa se evalúa antes de que exista el tema, por eso no se lee de él.
const BRAND_NIGHT_BLUE = '#020A1A';
const SPLASH_BACKGROUND_LIGHT = BRAND_NIGHT_BLUE;
const SPLASH_BACKGROUND_DARK = BRAND_NIGHT_BLUE;
const ADAPTIVE_ICON_BACKGROUND = BRAND_NIGHT_BLUE;

const CAMERA_USAGE_DESCRIPTION =
  'Usamos la cámara para escanear el código QR de tu centro y, si tú quieres, para hacerte una foto de perfil.';
const PHOTO_LIBRARY_USAGE_DESCRIPTION = 'Para que puedas elegir una foto de perfil de tu galería.';
const LOCATION_USAGE_DESCRIPTION =
  'Usamos tu ubicación solo mientras usas la app, para encontrar centros cerca de ti.';

// Permisos que Expo añade por defecto y que la app no necesita (minimización, SEC-22).
const ANDROID_PERMISSIONS_TO_BLOCK = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
] as const;

function buildIosInfoPlist(buildEnvironment: BuildEnvironment): Record<string, unknown> {
  const infoPlist: Record<string, unknown> = {
    ITSAppUsesNonExemptEncryption: false,
    NSCameraUsageDescription: CAMERA_USAGE_DESCRIPTION,
    NSPhotoLibraryUsageDescription: PHOTO_LIBRARY_USAGE_DESCRIPTION,
    NSLocationWhenInUseUsageDescription: LOCATION_USAGE_DESCRIPTION,
  };
  if (buildEnvironment.appEnvironment !== 'development') {
    // Sin excepciones de ATS. En desarrollo se conserva el valor por defecto de la plantilla
    // (NSAllowsLocalNetworking) porque el dev client necesita hablar con Metro por HTTP.
    infoPlist.NSAppTransportSecurity = { NSAllowsArbitraryLoads: false };
  }
  return infoPlist;
}

function buildAndroidIntentFilters(): NonNullable<
  NonNullable<ExpoConfig['android']>['intentFilters']
> {
  return [
    {
      action: 'VIEW',
      autoVerify: true,
      data: UNIVERSAL_LINK_PATH_PREFIXES.map((pathPrefix) => ({
        scheme: 'https',
        host: UNIVERSAL_LINK_HOST,
        pathPrefix,
      })),
      category: ['BROWSABLE', 'DEFAULT'],
    },
  ];
}

function buildPlugins(
  buildEnvironment: BuildEnvironment,
  appIdentity: AppIdentity,
): NonNullable<ExpoConfig['plugins']> {
  const plugins: NonNullable<ExpoConfig['plugins']> = [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: appIdentity.splashImagePath,
        imageWidth: SPLASH_IMAGE_WIDTH,
        resizeMode: 'contain',
        backgroundColor: SPLASH_BACKGROUND_LIGHT,
        dark: { image: appIdentity.splashImagePath, backgroundColor: SPLASH_BACKGROUND_DARK },
      },
    ],
    ['expo-build-properties', { android: { usesCleartextTraffic: false } }],
  ];
  // SEC-32: el dev client y su menú de depuración solo existen en builds de desarrollo.
  if (buildEnvironment.appEnvironment === 'development') plugins.push('expo-dev-client');
  return plugins;
}

function buildExtra(buildEnvironment: BuildEnvironment): Record<string, unknown> {
  // `extra` es público (viaja en el bundle): solo URL y datos no secretos (SEC-01).
  const extra: Record<string, unknown> = {
    appEnvironment: buildEnvironment.appEnvironment,
    apiUrl: buildEnvironment.apiUrl,
  };
  if (buildEnvironment.variant.kind === 'shared') {
    extra.eas = { projectId: SHARED_EAS_PROJECT_ID };
  }
  if (buildEnvironment.variant.kind === 'premium') {
    extra.lockedCenterId = buildEnvironment.variant.centerId;
  }
  return extra;
}

export function buildExpoConfig(buildEnvironment: BuildEnvironment): ExpoConfig {
  const appIdentity = resolveAppIdentity(buildEnvironment);
  const isProductionBuild = buildEnvironment.appEnvironment === 'production';

  return {
    name: appIdentity.name,
    slug: appIdentity.slug,
    scheme: appIdentity.scheme,
    version: APP_VERSION,
    orientation: 'portrait',
    platforms: ['ios', 'android'],
    icon: appIdentity.iconPath,
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: appIdentity.bundleIdentifier,
      supportsTablet: false,
      associatedDomains: [`applinks:${UNIVERSAL_LINK_HOST}`],
      infoPlist: buildIosInfoPlist(buildEnvironment),
      privacyManifests: { NSPrivacyTracking: false },
    },
    android: {
      package: appIdentity.bundleIdentifier,
      allowBackup: false,
      adaptiveIcon: {
        foregroundImage: appIdentity.adaptiveIconForegroundPath,
        backgroundColor: ADAPTIVE_ICON_BACKGROUND,
      },
      intentFilters: buildAndroidIntentFilters(),
      blockedPermissions: isProductionBuild ? [...ANDROID_PERMISSIONS_TO_BLOCK] : [],
    },
    plugins: buildPlugins(buildEnvironment, appIdentity),
    experiments: { typedRoutes: true },
    extra: buildExtra(buildEnvironment),
  };
}
