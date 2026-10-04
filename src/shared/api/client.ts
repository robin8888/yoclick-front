import { isApiError } from './api-error';
import type { HttpTransport } from './http-transport';

export const CENTER_ID_HEADER = 'X-Center-Id';
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';

const UNAUTHORIZED_STATUS = 401;
const PUBLIC_PATH_PREFIXES = ['/health', '/v1/auth'] as const;
// El cierre de sesión revoca el refresh token del usuario: exige estar autenticado.
const AUTHENTICATED_AUTH_PATHS = ['/v1/auth/logout'] as const;
// Las rutas de autenticación y /health no pertenecen a ningún centro.
const CENTERLESS_PATH_PREFIXES = ['/health', '/v1/auth', '/v1/me', '/v1/join'] as const;

export interface ApiClientDependencies {
  transport: HttpTransport;
  getAccessToken: () => string | null;
  getActiveCenterId: () => string | null;
  /** Renueva la sesión una sola vez aunque haya varias llamadas; `null` si ya no es válida. */
  refreshAccessToken: () => Promise<string | null>;
}

export interface ApiClient {
  /** Devuelve el cuerpo JSON ya parseado. Lanza `ApiError` o `NetworkError`. */
  request: <TResponseBody>(path: string, init: RequestInit) => Promise<TResponseBody>;
}

// Coincide por segmento completo: `/v1/me` cubre `/v1/me/consents` pero no `/v1/memberships`.
function startsWithAny(path: string, prefixes: readonly string[]): boolean {
  const pathWithoutQuery = path.split('?')[0] ?? path;
  return prefixes.some(
    (prefix) => pathWithoutQuery === prefix || pathWithoutQuery.startsWith(`${prefix}/`),
  );
}

export function isPublicPath(path: string): boolean {
  if (startsWithAny(path, AUTHENTICATED_AUTH_PATHS)) return false;
  return startsWithAny(path, PUBLIC_PATH_PREFIXES);
}

function isCenterScopedPath(path: string): boolean {
  return !startsWithAny(path, CENTERLESS_PATH_PREFIXES);
}

interface HeaderContext {
  accessToken: string | null;
  activeCenterId: string | null;
}

function buildHeaders(path: string, init: RequestInit, context: HeaderContext): Headers {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (isPublicPath(path)) return headers;
  if (context.accessToken !== null) {
    headers.set('Authorization', `Bearer ${context.accessToken}`);
  }
  if (
    context.activeCenterId !== null &&
    isCenterScopedPath(path) &&
    !headers.has(CENTER_ID_HEADER)
  ) {
    headers.set(CENTER_ID_HEADER, context.activeCenterId);
  }
  return headers;
}

export function createApiClient(dependencies: ApiClientDependencies): ApiClient {
  async function sendOnce(path: string, init: RequestInit, accessToken: string | null) {
    const headers = buildHeaders(path, init, {
      accessToken,
      activeCenterId: dependencies.getActiveCenterId(),
    });
    return dependencies.transport.send(path, { ...init, headers });
  }

  // Si otra petición ya renovó el token mientras esta volaba, se reintenta con el token vigente:
  // renovar otra vez rotaría el refresh token de nuevo sin necesidad.
  async function resolveReplacementAccessToken(rejectedAccessToken: string | null) {
    const currentAccessToken = dependencies.getAccessToken();
    if (currentAccessToken !== null && currentAccessToken !== rejectedAccessToken) {
      return currentAccessToken;
    }
    return dependencies.refreshAccessToken();
  }

  async function request<TResponseBody>(path: string, init: RequestInit): Promise<TResponseBody> {
    const accessToken = isPublicPath(path) ? null : dependencies.getAccessToken();
    try {
      const response = await sendOnce(path, init, accessToken);
      return response.body as TResponseBody;
    } catch (failure) {
      const isSessionExpired = isApiError(failure) && failure.status === UNAUTHORIZED_STATUS;
      if (!isSessionExpired || isPublicPath(path)) throw failure;
      const replacementAccessToken = await resolveReplacementAccessToken(accessToken);
      if (replacementAccessToken === null) throw failure;
      // El reintento reutiliza `init` tal cual: la misma Idempotency-Key viaja de nuevo.
      const retryResponse = await sendOnce(path, init, replacementAccessToken);
      return retryResponse.body as TResponseBody;
    }
  }

  return { request };
}
