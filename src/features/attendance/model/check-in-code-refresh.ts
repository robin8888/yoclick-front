const REFRESH_MARGIN_MS = 30_000;
const MIN_REFRESH_DELAY_MS = 5_000;

/**
 * Cuánto esperar antes de pedir otro QR: se renueva 30 s antes de que caduque para que nunca se
 * enseñe uno vencido, y nunca más seguido que cada 5 s aunque el reloj del móvil vaya desfasado.
 */
export function calculateRefreshDelayMs(expiresAtIso: string, nowMs: number): number {
  const millisecondsUntilExpiry = Date.parse(expiresAtIso) - nowMs;
  return Math.max(MIN_REFRESH_DELAY_MS, millisecondsUntilExpiry - REFRESH_MARGIN_MS);
}
