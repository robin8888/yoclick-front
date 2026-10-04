import { useSessionStore } from '@/shared/auth/session-store';

import { usePendingCenterStore } from '../model/pending-center-store';
import { useMyCenters } from './useMyCenters';

/**
 * Color con el que se viste la app: el del centro que se está uniendo y, con sesión, el del
 * centro activo. Sin ninguno, `undefined` = marca neutra de Yoclick.
 */
export function useAppBrandHexColor(): string | undefined {
  const pendingCenter = usePendingCenterStore((state) => state.pendingCenter);
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: memberships } = useMyCenters({ isEnabled: isSignedIn });

  if (pendingCenter !== null) return pendingCenter.brandHexColor;
  const activeMembership = memberships?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  );
  return activeMembership?.center.brandColor;
}
