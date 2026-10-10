import type {
  AssignContentRequestDtoTargetsItem,
  ContentResponseDto,
} from '@/shared/api/generated/model';

import type { ContentLevel } from './content-levels';

export interface DraftClient {
  membershipId: string;
  name: string;
}

/** Lo que la administración ha marcado en «Asignar contenido» antes de guardar. */
export interface AssignmentDraft {
  /** «Para todos»: lo ve todo el alumnado del centro. */
  isForEveryone: boolean;
  levels: readonly ContentLevel[];
  groupIds: readonly string[];
  clients: readonly DraftClient[];
}

export const EMPTY_ASSIGNMENT_DRAFT: AssignmentDraft = {
  isForEveryone: false,
  levels: [],
  groupIds: [],
  clients: [],
};

function toggleValue<TValue>(values: readonly TValue[], value: TValue): TValue[] {
  return values.includes(value)
    ? values.filter((existing) => existing !== value)
    : [...values, value];
}

export function toggleEveryone(draft: AssignmentDraft): AssignmentDraft {
  return { ...draft, isForEveryone: !draft.isForEveryone };
}

export function toggleLevel(draft: AssignmentDraft, level: ContentLevel): AssignmentDraft {
  return { ...draft, levels: toggleValue(draft.levels, level) };
}

export function toggleGroup(draft: AssignmentDraft, groupId: string): AssignmentDraft {
  return { ...draft, groupIds: toggleValue(draft.groupIds, groupId) };
}

export function addClient(draft: AssignmentDraft, client: DraftClient): AssignmentDraft {
  const isAlreadyThere = draft.clients.some(
    ({ membershipId }) => membershipId === client.membershipId,
  );
  return isAlreadyThere ? draft : { ...draft, clients: [...draft.clients, client] };
}

export function removeClient(draft: AssignmentDraft, membershipId: string): AssignmentDraft {
  return {
    ...draft,
    clients: draft.clients.filter((client) => client.membershipId !== membershipId),
  };
}

/** Lo que ya está asignado, para que la hoja se abra con eso marcado. */
export function buildDraftFromAssignments(
  assignments: ContentResponseDto['assignments'],
): AssignmentDraft {
  return assignments.reduce<AssignmentDraft>((draft, assignment) => {
    if (assignment.isForEveryone) return { ...draft, isForEveryone: true };
    if (assignment.level !== null) return toggleLevel(draft, assignment.level);
    if (assignment.groupId !== null) return toggleGroup(draft, assignment.groupId);
    if (assignment.clientMembershipId === null) return draft;
    return addClient(draft, {
      membershipId: assignment.clientMembershipId,
      name: assignment.label ?? '',
    });
  }, EMPTY_ASSIGNMENT_DRAFT);
}

/** Lo que se envía al servidor: la lista completa, que sustituye a la anterior. */
export function buildAssignmentTargets(
  draft: AssignmentDraft,
): AssignContentRequestDtoTargetsItem[] {
  return [
    ...(draft.isForEveryone ? [{ kind: 'everyone' } as const] : []),
    ...draft.levels.map((level) => ({ kind: 'level', level }) as const),
    ...draft.groupIds.map((groupId) => ({ kind: 'group', groupId }) as const),
    ...draft.clients.map(({ membershipId }) => ({ kind: 'client', membershipId }) as const),
  ];
}
