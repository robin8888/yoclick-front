import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { describeContentLevel } from './content-levels';

interface CaptionWords {
  levelWords: readonly string[];
  /** «Cliente» o «Alumno», ya con mayúscula inicial. */
  clientWord: string;
}

const CAPTION_SEPARATOR = ' · ';

function describeAssignment(
  assignment: ContentResponseDto['assignments'][number],
  words: CaptionWords,
): string {
  if (assignment.level !== null) {
    return i18n.t('content.assignment.level', {
      level: describeContentLevel(assignment.level, words.levelWords),
    });
  }
  if (assignment.groupId !== null) {
    return i18n.t('content.assignment.group', { name: assignment.label ?? '' });
  }
  return i18n.t('content.assignment.client', {
    kind: words.clientWord,
    name: assignment.label ?? '',
  });
}

/** «Nivel: Base · Grupo: Mañanas», o «Sin asignar» si nadie lo ve todavía. */
export function describeAssignments(
  assignments: ContentResponseDto['assignments'],
  words: CaptionWords,
): string {
  if (assignments.length === 0) return i18n.t('content.admin.unassigned');
  return assignments
    .map((assignment) => describeAssignment(assignment, words))
    .join(CAPTION_SEPARATOR);
}
