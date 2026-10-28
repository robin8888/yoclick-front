import type { VoiceOverviewResponseDtoUsage } from '@/shared/api/generated/model';

export type VoiceUsageLevel = 'normal' | 'near_limit' | 'limit_reached';

const NEAR_LIMIT_PERCENT = 80;
const LIMIT_REACHED_PERCENT = 100;
const FULL_BAR_PERCENT = 100;

/** Avisos del consumo: a partir del 80 % «cerca» y al 100 % «agotados», con palabras (no solo color). */
export function resolveVoiceUsageLevel(usedPercent: number): VoiceUsageLevel {
  if (usedPercent >= LIMIT_REACHED_PERCENT) return 'limit_reached';
  if (usedPercent >= NEAR_LIMIT_PERCENT) return 'near_limit';
  return 'normal';
}

/** El ancho de la barra: nunca pasa del 100 % aunque haya minutos de más. */
export function clampBarPercent(usedPercent: number): number {
  return Math.min(Math.max(usedPercent, 0), FULL_BAR_PERCENT);
}

type VoiceUsage = NonNullable<VoiceOverviewResponseDtoUsage>;

/** Los minutos que se muestran: usados, incluidos y los pasados de lo incluido. */
export function describeVoiceUsageMinutes(usage: VoiceUsage): {
  usedMinutes: number;
  includedMinutes: number;
  overageMinutes: number;
} {
  return {
    usedMinutes: usage.usedMinutes,
    includedMinutes: usage.includedMinutes,
    overageMinutes: usage.overageMinutes,
  };
}
