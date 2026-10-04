import Constants from 'expo-constants';
import { z } from 'zod';

export const API_TIMEOUT_MS = 15_000;

const HTTPS_PROTOCOL = 'https:';
const HTTP_PROTOCOL = 'http:';

interface ApiUrlSources {
  extraApiUrl?: unknown;
  environmentApiUrl?: unknown;
  isDevelopmentBuild: boolean;
}

// En producción solo HTTPS (SEC-19); en desarrollo se admite http para la API local.
function createApiUrlSchema(isDevelopmentBuild: boolean): z.ZodType<string> {
  return (
    z
      .url()
      .refine((candidateUrl) => {
        const { protocol } = new URL(candidateUrl);
        return protocol === HTTPS_PROTOCOL || (isDevelopmentBuild && protocol === HTTP_PROTOCOL);
      }, 'La URL de la API debe usar HTTPS')
      // `origin` descarta barras finales y rutas: los paths de la API ya llevan `/v1`.
      .transform((validUrl) => new URL(validUrl).origin)
  );
}

/** `extra.apiUrl` (app.config.ts) manda; `EXPO_PUBLIC_API_URL` es solo el recurso para desarrollo. */
export function resolveApiBaseUrl({
  extraApiUrl,
  environmentApiUrl,
  isDevelopmentBuild,
}: ApiUrlSources): string {
  const candidateUrl = extraApiUrl ?? environmentApiUrl;
  return createApiUrlSchema(isDevelopmentBuild).parse(candidateUrl);
}

const appConfigExtraSchema = z.object({ apiUrl: z.unknown() });

export function getApiBaseUrl(): string {
  const appConfigExtra = appConfigExtraSchema.safeParse(Constants.expoConfig?.extra);
  return resolveApiBaseUrl({
    extraApiUrl: appConfigExtra.success ? appConfigExtra.data.apiUrl : undefined,
    // Acceso literal: Expo solo sustituye `process.env.EXPO_PUBLIC_*` escrito as�.
    environmentApiUrl: process.env.EXPO_PUBLIC_API_URL,
    isDevelopmentBuild: __DEV__,
  });
}
