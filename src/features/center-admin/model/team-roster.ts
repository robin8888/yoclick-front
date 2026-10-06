import type { TeamResponseDtoMembersItem } from '@/shared/api/generated/model';

export type RosterMember = TeamResponseDtoMembersItem;

/** Quienes trabajan en el centro y siguen ahí: ni clientes ni quienes ya se fueron. */
export function selectRosterMembers(teamMembers: readonly RosterMember[]): readonly RosterMember[] {
  return teamMembers.filter((member) => member.role !== 'client' && member.status !== 'left');
}

/** La propietaria no se edita desde la app: el servidor tampoco lo permite. */
export function isRosterMemberEditable(member: RosterMember): boolean {
  return member.role !== 'owner';
}

export type EditableTeamRole = 'admin' | 'staff';

export function isEditableTeamRole(role: string): role is EditableTeamRole {
  return role === 'admin' || role === 'staff';
}
