import { useSessionStore } from '@/shared/auth/session-store';

import { useMyCenters } from './useMyCenters';

/** El tipo de centro activo (gimnasio, academia…): decide el vocabulario de las pantallas. */
export function useActiveCenterSectorId(): string | undefined {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: myCenters } = useMyCenters({ isEnabled: isSignedIn });

  return myCenters?.memberships.find((membership) => membership.centerId === activeCenterId)?.center
    .sectorId;
}
