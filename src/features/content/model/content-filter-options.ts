import { i18n } from '@/shared/i18n';

import type { ChoiceOption } from './choice-option';
import { CONTENT_LEVELS, describeContentLevel, type ContentLevel } from './content-levels';

/** «Todos» seguido de los tres niveles, con las palabras del tipo de centro. */
export function buildLevelFilterOptions(
  levelWords: readonly string[],
): ChoiceOption<ContentLevel | null>[] {
  return [
    { value: null, label: i18n.t('content.client.allLevels') },
    ...CONTENT_LEVELS.map((value) => ({ value, label: describeContentLevel(value, levelWords) })),
  ];
}

/** «Todas» seguido de las necesidades del tipo de centro. */
export function buildNeedFilterOptions(needs: readonly string[]): ChoiceOption<string | null>[] {
  return [
    { value: null, label: i18n.t('content.client.allNeeds') },
    ...needs.map((value) => ({ value, label: value })),
  ];
}
