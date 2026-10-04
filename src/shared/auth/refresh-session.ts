import { isApiError } from '@/shared/api/api-error';

export interface RotatedTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface SessionRefresherDependencies {
  readRefreshToken: () => Promise<string | null>;
  requestRotatedTokens: (refreshToken: string) => Promise<RotatedTokens>;
  saveRefreshToken: (refreshToken: string) => Promise<void>;
  applyAccessToken: (accessToken: string) => void;
  /** Se invoca cuando el servidor rechaza definitivamente la sesión (cierra sesión en local). */
  onSessionRejected: () => Promise<void>;
}

export interface SessionRefresher {
  /** Devuelve el nuevo access token, o `null` si la sesión ya no es válida. */
  refreshAccessToken: () => Promise<string | null>;
}

const REQUEST_TIMEOUT_STATUS = 408;
const TOO_MANY_REQUESTS_STATUS = 429;
const FIRST_CLIENT_ERROR_STATUS = 400;
const FIRST_SERVER_ERROR_STATUS = 500;

// Un 4xx significa que el servidor entendió el refresh token y lo rechazó (caducado, revocado o
// reutilizado). 408/429 y 5xx son transitorios: cerrar sesión por un fallo del servidor expulsaría
// a todos los usuarios cuando la API se cae.
function isDefinitiveRejection(error: unknown): boolean {
  if (!isApiError(error)) return false;
  const isClientError =
    error.status >= FIRST_CLIENT_ERROR_STATUS && error.status < FIRST_SERVER_ERROR_STATUS;
  return (
    isClientError &&
    error.status !== REQUEST_TIMEOUT_STATUS &&
    error.status !== TOO_MANY_REQUESTS_STATUS
  );
}

/**
 * El refresh token rota en cada uso y reutilizar uno ya rotado hace que el servidor revoque toda
 * la sesión. Por eso hay UNA sola renovación en vuelo: las peticiones que fallan a la vez esperan
 * a la misma promesa en lugar de lanzar la suya.
 */
export function createSessionRefresher(
  dependencies: SessionRefresherDependencies,
): SessionRefresher {
  let refreshInFlight: Promise<string | null> | null = null;

  async function rotateTokens(): Promise<string | null> {
    const currentRefreshToken = await dependencies.readRefreshToken();
    if (currentRefreshToken === null) {
      await dependencies.onSessionRejected();
      return null;
    }
    try {
      const rotatedTokens = await dependencies.requestRotatedTokens(currentRefreshToken);
      await dependencies.saveRefreshToken(rotatedTokens.refreshToken);
      dependencies.applyAccessToken(rotatedTokens.accessToken);
      return rotatedTokens.accessToken;
    } catch (failure) {
      if (!isDefinitiveRejection(failure)) throw failure;
      await dependencies.onSessionRejected();
      return null;
    }
  }

  function refreshAccessToken(): Promise<string | null> {
    refreshInFlight ??= rotateTokens().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  }

  return { refreshAccessToken };
}
