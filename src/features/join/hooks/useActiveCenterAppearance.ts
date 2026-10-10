import { useSessionStore } from '@/shared/auth/session-store';
import { DEFAULT_CENTER_APPEARANCE, type CenterAppearance } from '@/shared/theme';

import { useMyCenters } from './useMyCenters';

/** Fondo y colmena Premium del centro activo; sin sesión o sin personalizar, todo `null`. */
export function useActiveCenterAppearance(): CenterAppearance {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: memberships } = useMyCenters({ isEnabled: isSignedIn });
  if (!isSignedIn) return DEFAULT_CENTER_APPEARANCE;

  const activeCenter = memberships?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  )?.center;
  return activeCenter?.appearance ?? DEFAULT_CENTER_APPEARANCE;
}
