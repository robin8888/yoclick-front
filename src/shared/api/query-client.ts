import { QueryClient } from '@tanstack/react-query';

import { isApiError } from './api-error';

const MAX_RETRIES_FOR_TRANSIENT_FAILURES = 2;
const FIRST_SERVER_ERROR_STATUS = 500;
const STALE_TIME_MS = 30_000;

// Un 4xx no mejora reintentando (credenciales, validación, permisos); red y 5xx sí.
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status < FIRST_SERVER_ERROR_STATUS) return false;
  return failureCount < MAX_RETRIES_FOR_TRANSIENT_FAILURES;
}

// La caché no se persiste (SEC-33): vive solo en memoria y se vacía al cerrar sesión.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryQuery, staleTime: STALE_TIME_MS },
      // Reservas y pagos no se reintentan solos: cada reintento es una decisión del usuario.
      mutations: { retry: false },
    },
  });
}

export const queryClient = createQueryClient();
