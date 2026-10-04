import { API_TIMEOUT_MS, getApiBaseUrl } from '@/shared/api/api-config';
import { queryClient } from '@/shared/api/query-client';
import { secureStorage } from '@/shared/storage/secure';

import { useMinAppVersionStore } from '@/shared/hooks/min-app-version-store';
import { createSessionServices, type SessionServices } from './session-services';

let sessionServices: SessionServices | null = null;

// Perezoso: leer la URL de la API al importar rompería los tests y las pantallas de Storybook.
export function getSessionServices(): SessionServices {
  sessionServices ??= createSessionServices({
    baseUrl: getApiBaseUrl(),
    timeoutMs: API_TIMEOUT_MS,
    secureStorage,
    queryClient,
    onResponseHeaders: useMinAppVersionStore.getState().reportResponseHeaders,
  });
  return sessionServices;
}
