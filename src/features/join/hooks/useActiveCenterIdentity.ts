import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { useSessionStore } from '@/shared/auth/session-store';
import type { CenterIdentity } from '@/shared/theme';

import { useMyCenters } from './useMyCenters';

/** Nombre y logo del centro activo para las pantallas; `null` sin sesión o sin centro elegido. */
export function useActiveCenterIdentity(): CenterIdentity | null {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: memberships } = useMyCenters({ isEnabled: isSignedIn });
  if (!isSignedIn) return null;

  const activeCenter = memberships?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  )?.center;
  if (activeCenter === undefined) return null;
  return { name: activeCenter.name, logoImageUrl: resolveApiAssetUrl(activeCenter.logoUrl) };
}
