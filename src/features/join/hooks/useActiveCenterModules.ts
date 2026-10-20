import { useSessionStore } from '@/shared/auth/session-store';

import { ALL_CENTER_MODULES_ON, type CenterModules } from '../model/center-modules';
import { useMyCenters } from './useMyCenters';

/** Lo que usa el centro activo (contenido, asistencia, bonos, lista de espera, salas). */
export function useActiveCenterModules(): CenterModules {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { data: myCenters } = useMyCenters({ isEnabled: isSignedIn });

  const activeMembership = myCenters?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  );
  return activeMembership?.center.modules ?? ALL_CENTER_MODULES_ON;
}
