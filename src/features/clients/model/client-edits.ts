import type { UpdateClientRequestDto } from '@/shared/api/generated/model';

import { isClientLevelId, NO_CHOICE } from './group-form';

export interface ClientEdits {
  level?: string;
  groupId?: string;
}

/** Solo lo que se ha tocado: «sin nivel» o «sin grupo» se envían como `null`, que lo quita. */
export function buildClientChanges(edits: ClientEdits): UpdateClientRequestDto {
  const changes: UpdateClientRequestDto = {};
  if (edits.level !== undefined) changes.level = isClientLevelId(edits.level) ? edits.level : null;
  if (edits.groupId !== undefined) {
    changes.groupId = edits.groupId === NO_CHOICE ? null : edits.groupId;
  }
  return changes;
}
