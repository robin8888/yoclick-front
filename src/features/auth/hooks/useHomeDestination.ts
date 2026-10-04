import { useEffect } from 'react';

import { useMyCenters } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';

import { resolveHomeDestination, type HomeDestination } from '../model/resolve-home-destination';

interface HomeDestinationState {
  destination: HomeDestination | null;
  error: unknown;
  isRefetching: boolean;
  retry: () => void;
}

/** A qué zona entra la persona con sesión, según sus centros; fija también el centro activo. */
export function useHomeDestination(): HomeDestinationState {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const selectActiveCenter = useSessionStore((state) => state.selectActiveCenter);
  const myCenters = useMyCenters({ isEnabled: isSignedIn });
  const destination =
    myCenters.data === undefined
      ? null
      : resolveHomeDestination({
          memberships: myCenters.data.memberships,
          preferredCenterId: activeCenterId,
        });
  const resolvedCenterId = destination?.centerId ?? null;

  // El centro activo vive en el store de sesión (lo lee el cliente HTTP): se sincroniza con lo
  // que dicen los centros del servidor.
  useEffect(() => {
    if (destination !== null && resolvedCenterId !== activeCenterId) {
      selectActiveCenter(resolvedCenterId);
    }
  }, [destination, resolvedCenterId, activeCenterId, selectActiveCenter]);

  return {
    destination,
    error: myCenters.error,
    isRefetching: myCenters.isFetching,
    retry: () => void myCenters.refetch(),
  };
}
