import { useMyCenters } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';

/** El nombre del centro activo; vacío mientras todavía no se ha cargado. */
export function useCenterName(): string {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: myCenters } = useMyCenters({ isEnabled: isSignedIn });

  return (
    myCenters?.memberships.find((membership) => membership.centerId === activeCenterId)?.center
      .name ?? ''
  );
}
