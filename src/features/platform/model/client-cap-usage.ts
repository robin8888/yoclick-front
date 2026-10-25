export type CapUsageLevel = 'ok' | 'warning' | 'full';

export interface CapUsage {
  /** Fracción del tope usada, de 0 a 1 (nunca más: pasarse se indica con el nivel). */
  ratio: number;
  level: CapUsageLevel;
}

const WARNING_RATIO = 0.9;

/** Cuánto del tope de clientes usa un centro; `null` si no tiene tope. */
export function getCapUsage(activeClientCount: number, maxClients: number | null): CapUsage | null {
  if (maxClients === null || maxClients <= 0) return null;
  const rawRatio = activeClientCount / maxClients;
  const ratio = Math.min(1, rawRatio);
  if (rawRatio >= 1) return { ratio, level: 'full' };
  return { ratio, level: rawRatio >= WARNING_RATIO ? 'warning' : 'ok' };
}
