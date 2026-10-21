const MILLISECONDS_PER_DAY = 86_400_000;

interface TrialExtensionRequest {
  /** Fin de la prueba actual (ISO); `null` si el centro no tiene prueba en curso. */
  currentTrialEndsAt: string | null;
  now: Date;
  days: number;
}

/**
 * El nuevo fin de la prueba: los días que se amplían se suman al fin actual, o a hoy si la prueba ya
 * acabó o no había. Así ampliar nunca deja la fecha en el pasado (la API lo rechazaría).
 */
export function extendTrialEnd({ currentTrialEndsAt, now, days }: TrialExtensionRequest): string {
  const current = currentTrialEndsAt === null ? 0 : new Date(currentTrialEndsAt).getTime();
  const base = Math.max(current, now.getTime());
  return new Date(base + days * MILLISECONDS_PER_DAY).toISOString();
}
