import type { AppEnvironment, BuildEnvironment } from './parse-build-environment.ts';

export interface AppIdentity {
  name: string;
  slug: string;
  scheme: string;
  bundleIdentifier: string;
  iconPath: string;
  adaptiveIconForegroundPath: string;
  splashImagePath: string;
}

// ATENCIÓN: el identificador de la app compartida NO puede cambiar una vez publicada en App Store
// y Google Play. `com.yoclick.app` es un valor provisional hasta registrar las cuentas de
// desarrollador (ver STORE_CHECKLIST.md); decídelo antes del primer envío a las tiendas.
const SHARED_BUNDLE_IDENTIFIER = 'com.yoclick.app';
const PREMIUM_BUNDLE_IDENTIFIER_PREFIX = 'com.yoclick.center';
const SHARED_APP_NAME = 'Yoclick';
const SHARED_SLUG = 'yoclick';
const SHARED_SCHEME = 'yoclick';
const DEFAULT_ASSETS_DIRECTORY = './assets';

const ENVIRONMENT_SUFFIX: Record<AppEnvironment, { identifier: string; label: string }> = {
  development: { identifier: '.dev', label: ' (Dev)' },
  preview: { identifier: '.preview', label: ' (Preview)' },
  production: { identifier: '', label: '' },
};

// Android exige que cada segmento del package empiece por letra y no admite guiones.
export function toBundleIdentifierSegment(centerSlug: string): string {
  const slugWithoutHyphens = centerSlug.replaceAll('-', '');
  const isFirstCharacterDigit = /\d/u.test(slugWithoutHyphens.charAt(0));
  return isFirstCharacterDigit ? `c${slugWithoutHyphens}` : slugWithoutHyphens;
}

export function getPremiumAssetsDirectory(centerSlug: string): string {
  return `${DEFAULT_ASSETS_DIRECTORY}/centers/${centerSlug}`;
}

function buildAssetPaths(
  assetsDirectory: string,
): Pick<AppIdentity, 'iconPath' | 'adaptiveIconForegroundPath' | 'splashImagePath'> {
  return {
    iconPath: `${assetsDirectory}/icon.png`,
    adaptiveIconForegroundPath: `${assetsDirectory}/adaptive-icon.png`,
    splashImagePath: `${assetsDirectory}/splash-icon.png`,
  };
}

export function resolveAppIdentity(buildEnvironment: BuildEnvironment): AppIdentity {
  const { appEnvironment, variant } = buildEnvironment;
  const environmentSuffix = ENVIRONMENT_SUFFIX[appEnvironment];
  // Los esquemas de dev/preview llevan sufijo para que dos instalaciones no compitan por el mismo.
  const schemeSuffix = appEnvironment === 'production' ? '' : `-${appEnvironment}`;

  if (variant.kind === 'shared') {
    return {
      name: `${SHARED_APP_NAME}${environmentSuffix.label}`,
      slug: SHARED_SLUG,
      scheme: `${SHARED_SCHEME}${schemeSuffix}`,
      bundleIdentifier: `${SHARED_BUNDLE_IDENTIFIER}${environmentSuffix.identifier}`,
      ...buildAssetPaths(DEFAULT_ASSETS_DIRECTORY),
    };
  }

  const bundleSegment = toBundleIdentifierSegment(variant.centerSlug);
  return {
    name: `${variant.centerName}${environmentSuffix.label}`,
    slug: variant.centerSlug,
    scheme: `${SHARED_SCHEME}-${variant.centerSlug}${schemeSuffix}`,
    bundleIdentifier: `${PREMIUM_BUNDLE_IDENTIFIER_PREFIX}.${bundleSegment}${environmentSuffix.identifier}`,
    ...buildAssetPaths(getPremiumAssetsDirectory(variant.centerSlug)),
  };
}
