import { useQuery } from '@tanstack/react-query';

import { getMeGetProfileQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import { useSessionStore } from '@/shared/auth/session-store';

import { resolveSignedInRoleLabel } from '../model/signed-in-role-label';
import { useMyCenters } from './useMyCenters';

interface SignedInIdentity {
  /** `null` si la sesión se restauró y aún no se conoce el nombre. */
  fullName: string | null;
  roleLabel: string;
}

/** Quién ha entrado: su nombre y el papel que tiene en el centro activo (o «Alumno» sin centro). */
export function useSignedInIdentity(): SignedInIdentity | null {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const sessionFullName = useSessionStore((state) => state.user?.fullName ?? null);
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const { data: myCenters } = useMyCenters({ isEnabled: isSignedIn });
  // Al restaurar la sesión el nombre no está en memoria: se pide al perfil.
  const profile = useQuery(
    getMeGetProfileQueryOptions({ query: { enabled: isSignedIn && sessionFullName === null } }),
  );
  const fullName = sessionFullName ?? profile.data?.fullName ?? null;

  if (!isSignedIn) return null;
  const activeMembership = myCenters?.memberships.find(
    (membership) => membership.status === 'active' && membership.centerId === activeCenterId,
  );
  const roleLabel = resolveSignedInRoleLabel({
    role: activeMembership?.role ?? null,
    sectorId: activeMembership?.center.sectorId,
  });
  return { fullName, roleLabel };
}
