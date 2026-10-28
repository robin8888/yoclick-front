import { useMyCenters } from '@/features/join';

import type { ChatRole } from '../model/block-rules';
import { useActiveCenterId } from './useActiveCenterId';

/** El papel de quien mira en el centro activo, o `null` mientras no se sepa. */
export function useMyChatRole(): ChatRole | null {
  const activeCenterId = useActiveCenterId();
  const memberships = useMyCenters();
  const activeMembership = memberships.data?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  );
  return activeMembership?.role ?? null;
}
