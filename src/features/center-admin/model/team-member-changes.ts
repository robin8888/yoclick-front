import type { UpdateTeamMemberRequestDto } from '@/shared/api/generated/model';

import { haveSameServices } from './service-selection';
import { buildPermissionChange, type GrantablePermission } from './team-permissions';
import type { EditableTeamRole, RosterMember } from './team-roster';

export const MAX_STAFF_TITLE_LENGTH = 80;

export interface TeamMemberDraft {
  role: EditableTeamRole;
  staffTitle: string;
  /** Solo cuentan para quien da las sesiones: administración ya lo ve todo. */
  grantedPermissions: GrantablePermission[];
  /** Los servicios que da la persona (los que presta la academia). */
  serviceIds: string[];
}

/** Solo lo que cambia: el servidor rechaza campos que no se pueden tocar. `null` si no hay cambios. */
export function buildTeamMemberChanges(
  draft: TeamMemberDraft,
  member: RosterMember,
): UpdateTeamMemberRequestDto | null {
  const changes: UpdateTeamMemberRequestDto = {};
  const draftTitle = draft.staffTitle.trim();
  if (draft.role !== member.role) changes.role = draft.role;
  if (draftTitle !== (member.staffTitle ?? '')) {
    changes.staffTitle = draftTitle === '' ? null : draftTitle;
  }
  const permissionChange =
    draft.role === 'staff'
      ? buildPermissionChange(member.permissions, draft.grantedPermissions)
      : null;
  if (permissionChange !== null) changes.permissions = permissionChange;
  const currentServiceIds = member.services.map(({ id }) => id);
  if (!haveSameServices(draft.serviceIds, currentServiceIds)) changes.serviceIds = draft.serviceIds;
  return Object.keys(changes).length === 0 ? null : changes;
}
