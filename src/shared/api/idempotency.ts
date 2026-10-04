import { randomUUID } from 'expo-crypto';

import { IDEMPOTENCY_KEY_HEADER } from './client';

export interface IdempotencyIntention {
  /** Cabeceras para pasar en las opciones de la petición generada (`request: { headers }`). */
  readonly headers: Record<string, string>;
  readonly key: string;
}

/**
 * Una intención del usuario (pulsar «Reservar») = una clave. Los reintentos de esa misma intención
 * reutilizan el objeto; solo se crea otro cuando el usuario vuelve a decidir la acción (SEC-36).
 */
export function createIdempotencyIntention(
  generateKey: () => string = randomUUID,
): IdempotencyIntention {
  const key = generateKey();
  return { key, headers: { [IDEMPOTENCY_KEY_HEADER]: key } };
}
