import type { UpdateTeamMemberRequestDto } from '@/shared/api/generated/model';

import { buildPermissionChange, type GrantablePermission } from './team-permissions';
import type { EditableTeamRole, RosterMember } from './team-roster';

export const MAX_STAFF_TITLE_LENGTH = 80;

export interface TeamMemberDraft {
  role: EditableTeamRole;
  staffTitle: string;
  /** Solo cuentan para quien da las sesiones: administración ya lo ve todo. */
  grantedPermissions: GrantablePermission[];
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
  return Object.keys(changes).length === 0 ? null : changes;
}
