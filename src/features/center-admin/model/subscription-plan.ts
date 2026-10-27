const MILLISECONDS_PER_DAY = 86_400_000;
const PERCENT = 100;

/** Cuánto del tope se usa, de 0 a 100; `null` si el plan no tiene tope. */
export function calculateClientUsagePercent(
  activeClientCount: number,
  maxClients: number | null,
): number | null {
  if (maxClients === null || maxClients <= 0) return null;
  return Math.min(PERCENT, Math.round((activeClientCount / maxClients) * PERCENT));
}

/** Días enteros que quedan de prueba (0 si es hoy o ya acabó); `null` si no hay prueba. */
export function countTrialDaysLeft(trialEndsAtIso: string | null, now: Date): number | null {
  if (trialEndsAtIso === null) return null;
  const millisecondsLeft = new Date(trialEndsAtIso).getTime() - now.getTime();
  return Math.max(0, Math.ceil(millisecondsLeft / MILLISECONDS_PER_DAY));
}
