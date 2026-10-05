import Constants from 'expo-constants';
import { z } from 'zod';

export const API_TIMEOUT_MS = 15_000;

const HTTPS_PROTOCOL = 'https:';
const HTTP_PROTOCOL = 'http:';

interface ApiUrlSources {
  extraApiUrl?: unknown;
  environmentApiUrl?: unknown;
  isDevelopmentBuild: boolean;
  /** `host:puerto` del servidor de desarrollo (Metro) desde el que el móvil cargó la app. */
  devServerHostUri?: string | null | undefined;
}

// En desarrollo la API local corre en la misma máquina que Metro. En un móvil real «localhost» es
// el propio móvil y una IP escrita a mano caduca al cambiar de red, así que se usa la IP de Metro,
// que la app ya conoce, conservando el puerto de la API configurada.
function applyDevServerHost(apiUrl: string, devServerHostUri: string): string {
  const devServerHostname = devServerHostUri.split(':')[0];
  if (devServerHostname === undefined || devServerHostname === '') return apiUrl;
  const parsedApiUrl = new URL(apiUrl);
  // Una API remota (https) no vive en la máquina de Metro.
  if (parsedApiUrl.protocol !== HTTP_PROTOCOL) return apiUrl;
  parsedApiUrl.hostname = devServerHostname;
  return parsedApiUrl.origin;
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
  devServerHostUri,
}: ApiUrlSources): string {
  const candidateUrl = extraApiUrl ?? environmentApiUrl;
  const apiUrl = createApiUrlSchema(isDevelopmentBuild).parse(candidateUrl);
  if (!isDevelopmentBuild || devServerHostUri === undefined || devServerHostUri === null) {
    return apiUrl;
  }
  return applyDevServerHost(apiUrl, devServerHostUri);
}

const appConfigExtraSchema = z.object({ apiUrl: z.unknown() });

export function getApiBaseUrl(): string {
  const appConfigExtra = appConfigExtraSchema.safeParse(Constants.expoConfig?.extra);
  return resolveApiBaseUrl({
    extraApiUrl: appConfigExtra.success ? appConfigExtra.data.apiUrl : undefined,
    // Acceso literal: Expo solo sustituye `process.env.EXPO_PUBLIC_*` escrito as�.
    environmentApiUrl: process.env.EXPO_PUBLIC_API_URL,
    isDevelopmentBuild: __DEV__,
    devServerHostUri: Constants.expoConfig?.hostUri,
  });
}
