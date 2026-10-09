import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { describeContentLevel } from './content-levels';

const CAPTION_SEPARATOR = ' · ';

/** «Vídeo · Base · Fuerza»: de qué tipo es, para qué nivel y qué necesidad cubre. */
export function buildMediaCaption(
  content: Pick<ContentResponseDto, 'kind' | 'level' | 'need'>,
  levelWords: readonly string[],
): string {
  return [
    i18n.t(`content.kind.${content.kind}`),
    content.level === null ? null : describeContentLevel(content.level, levelWords),
    content.need,
  ]
    .filter((part) => part !== null)
    .join(CAPTION_SEPARATOR);
}
