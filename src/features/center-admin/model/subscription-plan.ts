export type SubscriptionPlanId = 'basic' | 'pro' | 'premium' | 'custom';

const BASIC_CLIENT_LIMIT = 150;
const PRO_CLIENT_LIMIT = 500;
const MILLISECONDS_PER_DAY = 86_400_000;
const PERCENT = 100;

/**
 * El plan se deduce del tope de clientes (docs/spec/00-producto.md › Planes): 150 es Básico, 500 es
 * Pro y sin tope es Premium. Cualquier otro tope lo ha acordado Yoclick a mano.
 */
export function resolveSubscriptionPlan(maxClients: number | null): SubscriptionPlanId {
  if (maxClients === null) return 'premium';
  if (maxClients === BASIC_CLIENT_LIMIT) return 'basic';
  return maxClients === PRO_CLIENT_LIMIT ? 'pro' : 'custom';
}

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
