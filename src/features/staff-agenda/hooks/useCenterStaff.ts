import { useQuery } from '@tanstack/react-query';

import { getTeamListQueryOptions } from '@/shared/api/generated/endpoints/team/team';
import { useSessionStore } from '@/shared/auth/session-store';

import type { AgendaStaffMember } from '../model/center-agenda-summary';

const STAFF_ROLES: readonly string[] = ['owner', 'admin', 'staff'];

/** Quién da citas en el centro activo; solo lo consulta quien administra el centro. */
export function useCenterStaff(): AgendaStaffMember[] {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const team = useQuery(
    getTeamListQueryOptions(centerId ?? '', { query: { enabled: centerId !== null } }),
  );

  const staffMembers = (team.data?.members ?? []).filter(
    (member) => member.status === 'active' && STAFF_ROLES.includes(member.role),
  );
  // Una persona con dos membresías en el centro (p. ej. propietaria y profesora) es una sola columna.
  const uniqueStaffByUser = new Map(staffMembers.map((member) => [member.userId, member]));

  return [...uniqueStaffByUser.values()].map(({ membershipId, fullName }) => ({
    membershipId,
    fullName,
  }));
}
