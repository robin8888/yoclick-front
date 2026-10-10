import { useState } from 'react';

import type { ContentResponseDto } from '@/shared/api/generated/model';

import {
  addClient,
  buildDraftFromAssignments,
  removeClient,
  toggleEveryone,
  toggleGroup,
  toggleLevel,
  type AssignmentDraft,
  type DraftClient,
} from '../model/assignment-draft';
import type { ContentLevel } from '../model/content-levels';

interface AssignmentDraftState {
  draft: AssignmentDraft;
  onEveryoneToggle: () => void;
  onLevelToggle: (level: ContentLevel) => void;
  onGroupToggle: (groupId: string) => void;
  onClientAdd: (client: DraftClient) => void;
  onClientRemove: (membershipId: string) => void;
}

/** Lo marcado en «Asignar contenido», que empieza con lo que la pieza ya tiene asignado. */
export function useAssignmentDraft(
  assignments: ContentResponseDto['assignments'],
): AssignmentDraftState {
  const [draft, setDraft] = useState(() => buildDraftFromAssignments(assignments));

  return {
    draft,
    onEveryoneToggle: () => {
      setDraft((current) => toggleEveryone(current));
    },
    onLevelToggle: (level) => {
      setDraft((current) => toggleLevel(current, level));
    },
    onGroupToggle: (groupId) => {
      setDraft((current) => toggleGroup(current, groupId));
    },
    onClientAdd: (client) => {
      setDraft((current) => addClient(current, client));
    },
    onClientRemove: (membershipId) => {
      setDraft((current) => removeClient(current, membershipId));
    },
  };
}
