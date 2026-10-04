import { getSessionServices } from '@/shared/auth/default-session-services';

import type { ApiError } from './api-error';

/**
 * Mutator de Orval: todas las funciones generadas pasan por aquí. Devuelve el cuerpo ya parseado
 * y lanza `ApiError` / `NetworkError` en lugar de devolver el error dentro de la unión de tipos.
 */
export function apiMutator<TResponseBody>(path: string, init: RequestInit): Promise<TResponseBody> {
  return getSessionServices().apiClient.request<TResponseBody>(path, init);
}

// Orval tipa los errores de los hooks con este alias; el parámetro es el cuerpo problem+json
// documentado en el contrato, que aquí siempre se convierte en `ApiError`.
export type ErrorType<TProblemBody = unknown> = ApiError & { readonly problemBody?: TProblemBody };
