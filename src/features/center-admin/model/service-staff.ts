import type { TeamResponseDtoMembersItem } from '@/shared/api/generated/model';

export interface AssignableStaffMember {
  membershipId: string;
  fullName: string;
  /** «Entrenador personal»; vacío si el equipo no le ha puesto cargo. */
  staffTitle: string | null;
}

// Mismos roles que acepta el servidor al asignar quién da un servicio: los clientes no pueden.
const ASSIGNABLE_ROLES: readonly string[] = ['owner', 'admin', 'staff'];

/** Quién puede dar servicios: el equipo ya activo (una invitación pendiente aún no existe). */
export function selectAssignableStaff(
  teamMembers: readonly TeamResponseDtoMembersItem[],
): AssignableStaffMember[] {
  return teamMembers
    .filter((member) => member.status === 'active' && ASSIGNABLE_ROLES.includes(member.role))
    .map(({ membershipId, fullName, staffTitle }) => ({ membershipId, fullName, staffTitle }));
}

/** Añade o quita a una persona de la selección, sin repetirla. */
export function toggleStaffSelection(
  selectedMembershipIds: readonly string[],
  membershipId: string,
): string[] {
  return selectedMembershipIds.includes(membershipId)
    ? selectedMembershipIds.filter((selectedId) => selectedId !== membershipId)
    : [...selectedMembershipIds, membershipId];
}
