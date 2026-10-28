export type AppEnvironment = 'development' | 'preview' | 'production';

export interface BuildEnvironment {
  appEnvironment: AppEnvironment;
  apiUrl: string;
}

export type RawEnvironment = Readonly<Record<string, string | undefined>>;

export class AppConfigError extends Error {
  constructor(message: string) {
    super(`[app.config] ${message}`);
    this.name = 'AppConfigError';
  }
}

export const PRODUCTION_API_URL = 'https://api.yoclick.app';
const DEFAULT_DEVELOPMENT_API_URL = 'http://localhost:3000';
const APP_ENVIRONMENTS: readonly AppEnvironment[] = ['development', 'preview', 'production'];

function parseAppEnvironment(rawAppEnvironment: string | undefined): AppEnvironment {
  if (rawAppEnvironment === undefined || rawAppEnvironment === '') return 'development';
  const matchingEnvironment = APP_ENVIRONMENTS.find((candidate) => candidate === rawAppEnvironment);
  if (matchingEnvironment === undefined) {
    // Sin valor por defecto silencioso: un typo en el perfil de EAS no debe producir un build «dev».
    throw new AppConfigError(
      `APP_ENV must be one of ${APP_ENVIRONMENTS.join(', ')}, received "${rawAppEnvironment}".`,
    );
  }
  return matchingEnvironment;
}

function parseUrlOrThrow(apiUrl: string): URL {
  try {
    return new URL(apiUrl);
  } catch {
    throw new AppConfigError(`API_URL is not a valid URL: "${apiUrl}".`);
  }
}

function hasUrlPartsBeyondOrigin(parsedUrl: URL): boolean {
  return (
    parsedUrl.username !== '' ||
    parsedUrl.password !== '' ||
    parsedUrl.pathname !== '/' ||
    parsedUrl.search !== '' ||
    parsedUrl.hash !== ''
  );
}

// SEC-31: un build de producción nunca debe apuntar a otra API.
function assertIsProductionApiUrl(parsedUrl: URL): void {
  if (parsedUrl.origin !== PRODUCTION_API_URL || hasUrlPartsBeyondOrigin(parsedUrl)) {
    throw new AppConfigError(`Production builds must use API_URL=${PRODUCTION_API_URL}.`);
  }
}

function assertIsAcceptableNonProductionApiUrl(
  appEnvironment: AppEnvironment,
  parsedUrl: URL,
): void {
  if (hasUrlPartsBeyondOrigin(parsedUrl)) {
    throw new AppConfigError('API_URL must be an origin without credentials, path or query.');
  }
  if (appEnvironment === 'preview' && parsedUrl.protocol !== 'https:') {
    throw new AppConfigError('Preview builds require an https API_URL.');
  }
}

function parseApiUrl(appEnvironment: AppEnvironment, rawApiUrl: string | undefined): string {
  const apiUrl = rawApiUrl?.trim() ?? '';
  if (apiUrl === '') {
    if (appEnvironment === 'development') return DEFAULT_DEVELOPMENT_API_URL;
    throw new AppConfigError(`API_URL is required for ${appEnvironment} builds.`);
  }

  const parsedUrl = parseUrlOrThrow(apiUrl);
  if (appEnvironment === 'production') {
    assertIsProductionApiUrl(parsedUrl);
    return PRODUCTION_API_URL;
  }
  assertIsAcceptableNonProductionApiUrl(appEnvironment, parsedUrl);
  return parsedUrl.origin;
}

export function parseBuildEnvironment(rawEnvironment: RawEnvironment): BuildEnvironment {
  const appEnvironment = parseAppEnvironment(rawEnvironment.APP_ENV);
  return {
    appEnvironment,
    apiUrl: parseApiUrl(appEnvironment, rawEnvironment.API_URL),
  };
}
