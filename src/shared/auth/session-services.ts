import type { QueryClient } from '@tanstack/react-query';

import { ApiError, isApiError, isNetworkError } from '@/shared/api/api-error';
import { createApiClient, type ApiClient } from '@/shared/api/client';
import { AuthRefreshBody, AuthRefreshResponse } from '@/shared/api/generated/zod/auth/auth.zod';
import { createHttpTransport, type HttpTransport } from '@/shared/api/http-transport';
import type { SecureStorage } from '@/shared/storage/secure';

import { createSessionRefresher, type RotatedTokens } from './refresh-session';
import { createLocalSignOut } from './sign-out';
import { useSessionStore, type SessionUser } from './session-store';

const REFRESH_PATH = '/v1/auth/refresh';
const LOGOUT_PATH = '/v1/auth/logout';
const INVALID_STORED_TOKEN_STATUS = 401;

export interface SessionServicesConfig {
  baseUrl: string;
  timeoutMs: number;
  secureStorage: SecureStorage;
  queryClient: QueryClient;
  fetchImplementation?: typeof fetch;
  onResponseHeaders?: (headers: Headers) => void;
}

export interface StartSessionInput extends RotatedTokens {
  readonly user: SessionUser;
}

export interface SessionServices {
  apiClient: ApiClient;
  startSession: (input: StartSessionInput) => Promise<void>;
  /** Arranque en frío: intercambia el refresh token guardado por un access token en memoria. */
  restoreSession: () => Promise<void>;
  signOut: (options?: { shouldRevokeEverywhere?: boolean }) => Promise<void>;
}

async function requestRotatedTokens(
  transport: HttpTransport,
  refreshToken: string,
): Promise<RotatedTokens> {
  const requestBody = AuthRefreshBody.safeParse({ refreshToken });
  if (!requestBody.success) {
    // Un valor corrupto en SecureStore nunca será válido: equivale a una sesión rechazada.
    throw new ApiError({ code: 'SESSION_INVALID', status: INVALID_STORED_TOKEN_STATUS });
  }
  const response = await transport.send(REFRESH_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(requestBody.data),
  });
  const rotatedTokens = AuthRefreshResponse.parse(response.body);
  return { accessToken: rotatedTokens.accessToken, refreshToken: rotatedTokens.refreshToken };
}

interface ClientWiring {
  apiClient: ApiClient;
  refreshAccessToken: () => Promise<string | null>;
  signOutLocally: () => Promise<void>;
}

function wireApiClient(config: SessionServicesConfig): ClientWiring {
  const { secureStorage, queryClient } = config;
  const sessionActions = useSessionStore.getState();
  const transport = createHttpTransport({
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    ...(config.fetchImplementation ? { fetchImplementation: config.fetchImplementation } : {}),
    ...(config.onResponseHeaders ? { onResponseHeaders: config.onResponseHeaders } : {}),
  });
  const signOutLocally = createLocalSignOut({
    secureStorage,
    queryClient,
    resetSession: sessionActions.resetSession,
  });
  const { refreshAccessToken } = createSessionRefresher({
    readRefreshToken: secureStorage.readRefreshToken,
    requestRotatedTokens: (refreshToken) => requestRotatedTokens(transport, refreshToken),
    saveRefreshToken: secureStorage.saveRefreshToken,
    applyAccessToken: sessionActions.replaceAccessToken,
    onSessionRejected: signOutLocally,
  });
  const apiClient = createApiClient({
    transport,
    getAccessToken: () => useSessionStore.getState().accessToken,
    getActiveCenterId: () => useSessionStore.getState().activeCenterId,
    refreshAccessToken,
  });
  return { apiClient, refreshAccessToken, signOutLocally };
}

export function createSessionServices(config: SessionServicesConfig): SessionServices {
  const { secureStorage } = config;
  const sessionActions = useSessionStore.getState();
  const { apiClient, refreshAccessToken, signOutLocally } = wireApiClient(config);

  async function startSession(input: StartSessionInput): Promise<void> {
    await secureStorage.saveRefreshToken(input.refreshToken);
    sessionActions.startSession({ accessToken: input.accessToken, user: input.user });
  }

  async function restoreSession(): Promise<void> {
    const refreshToken = await secureStorage.readRefreshToken();
    if (refreshToken === null) {
      sessionActions.resetSession();
      return;
    }
    await refreshAccessToken();
  }

  // Revocar en el servidor es un extra de seguridad: sin conexi�n o con la sesi�n ya caducada
  // el usuario debe poder salir igualmente, as� que esos fallos no impiden el cierre local.
  async function revokeRefreshToken(shouldRevokeEverywhere: boolean): Promise<void> {
    const refreshToken = await secureStorage.readRefreshToken();
    if (refreshToken === null) return;
    try {
      await apiClient.request<undefined>(LOGOUT_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, everywhere: shouldRevokeEverywhere }),
      });
    } catch (failure) {
      if (!isApiError(failure) && !isNetworkError(failure)) throw failure;
    }
  }

  async function signOut(options: { shouldRevokeEverywhere?: boolean } = {}): Promise<void> {
    await revokeRefreshToken(options.shouldRevokeEverywhere ?? false);
    await signOutLocally();
  }

  return { apiClient, startSession, restoreSession, signOut };
}
