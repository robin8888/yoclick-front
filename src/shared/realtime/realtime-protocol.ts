import { z } from 'zod';

/** Lo que avisa el servidor. Nunca lleva contenido: la app recarga lo que cambió por la API normal. */
export const realtimeEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('chat.updated'), conversationId: z.string().nullable() }),
]);

export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

/** El servidor cierra con este código si el token no vale o caducó: se vuelve a conectar con uno nuevo. */
export const CLOSE_UNAUTHENTICATED = 4401;

const REALTIME_PATH = '/v1/realtime';

/** `https://api…` → `wss://api…/v1/realtime`; `http` (solo desarrollo) → `ws`. */
export function buildRealtimeUrl(apiBaseUrl: string): string {
  const url = new URL(REALTIME_PATH, apiBaseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

/** Espera antes de reintentar: 1 s, 2 s, 4 s… hasta 30 s. */
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_GROWTH_FACTOR = 2;

export function computeReconnectDelayMs(attempt: number): number {
  return Math.min(RECONNECT_BASE_MS * RECONNECT_GROWTH_FACTOR ** attempt, RECONNECT_MAX_MS);
}
