import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useMyCenters } from '@/features/join';
import { getMeGetProfileQueryOptions } from '@/shared/api/generated/endpoints/me/me';
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
  // El rol de plataforma viene del perfil. Si el perfil falla no se bloquea la entrada: se entra como
  // cualquier persona, y la API es la que decide lo que se puede hacer.
  const profile = useQuery(getMeGetProfileQueryOptions({ query: { enabled: isSignedIn } }));
  const destination =
    myCenters.data === undefined || profile.isPending
      ? null
      : resolveHomeDestination({
          memberships: myCenters.data.memberships,
          preferredCenterId: activeCenterId,
          platformRole: profile.data?.platformRole ?? 'none',
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
