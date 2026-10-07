import { useRouter } from 'expo-router';
import { useState } from 'react';

import type { UpdateTeamMemberRequestDto } from '@/shared/api/generated/model';

import { buildTeamMemberChanges, type TeamMemberDraft } from '../model/team-member-changes';
import { pickGrantedPermissions } from '../model/team-permissions';
import { isEditableTeamRole, type RosterMember } from '../model/team-roster';
import { useTeamRoster } from './useTeamRoster';
import { useUpdateTeamMember } from './useUpdateTeamMember';

interface TeamMemberEditor {
  member: RosterMember | undefined;
  /** `null` si la persona no se puede editar (la propietaria) o aún no ha cargado. */
  draft: TeamMemberDraft | null;
  changes: UpdateTeamMemberRequestDto | null;
  isUpdating: boolean;
  errorMessage: string | null;
  changeDraft: (changes: Partial<TeamMemberDraft>) => void;
  saveChanges: () => void;
  removeFromTeam: () => void;
}

function buildDraft(
  member: RosterMember | undefined,
  edits: Partial<TeamMemberDraft>,
): TeamMemberDraft | null {
  if (member === undefined || !isEditableTeamRole(member.role)) return null;
  return {
    role: member.role,
    staffTitle: member.staffTitle ?? '',
    grantedPermissions: pickGrantedPermissions(member.permissions),
    ...edits,
  };
}

/** El borrador de una persona del equipo: lo que hay en el servidor más lo que se va cambiando. */
export function useTeamMemberEditor(membershipId: string): TeamMemberEditor {
  const router = useRouter();
  const roster = useTeamRoster();
  const update = useUpdateTeamMember(membershipId, router.back);
  const [edits, setEdits] = useState<Partial<TeamMemberDraft>>({});
  const member = roster.data?.members.find((candidate) => candidate.membershipId === membershipId);
  const draft = buildDraft(member, edits);
  const changes =
    member === undefined || draft === null ? null : buildTeamMemberChanges(draft, member);

  return {
    member,
    draft,
    changes,
    isUpdating: update.isUpdating,
    errorMessage: update.errorMessage,
    changeDraft: (nextEdits) => {
      setEdits((current) => ({ ...current, ...nextEdits }));
    },
    saveChanges: () => {
      if (changes !== null) update.updateMember(changes);
    },
    removeFromTeam: () => {
      update.updateMember({ status: 'left' });
    },
  };
}
