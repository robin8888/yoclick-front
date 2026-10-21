import type { PlatformCenterListResponseDtoDataItem } from '@/shared/api/generated/model';

export type CenterAttention = 'over-limit' | 'trial-ending' | 'past-due' | 'suspended';

const MILLISECONDS_PER_DAY = 86_400_000;
const TRIAL_WARNING_DAYS = 7;

type CenterFacts = Pick<
  PlatformCenterListResponseDtoDataItem,
  'status' | 'trialEndsAt' | 'maxClients' | 'activeClientCount'
>;

/**
 * Por qué merece mirar un centro: suspendido, en gracia por impago, con la prueba a punto de acabar o
 * por encima de su tope de clientes. Una sola razón, la más urgente; `null` si no hay ninguna.
 */
export function getCenterAttention(center: CenterFacts, now: Date): CenterAttention | null {
  if (center.status === 'suspended') return 'suspended';
  if (center.status === 'past_due') return 'past-due';
  if (center.maxClients !== null && center.activeClientCount > center.maxClients) {
    return 'over-limit';
  }
  if (center.status === 'trial' && center.trialEndsAt !== null) {
    const daysLeft =
      (new Date(center.trialEndsAt).getTime() - now.getTime()) / MILLISECONDS_PER_DAY;
    if (daysLeft <= TRIAL_WARNING_DAYS) return 'trial-ending';
  }
  return null;
}
