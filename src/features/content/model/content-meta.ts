import { formatStorageSize, formatVideoDuration } from '@/features/videos';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

type MetaFacts = Pick<ContentResponseDto, 'kind' | 'durationSeconds' | 'pageCount' | 'sizeBytes'>;

/** Lo que se ve en la esquina de la miniatura: «9:30» en un vídeo, «6 págs.» en un PDF. */
export function describeContentMeta(content: MetaFacts): string {
  if (content.kind === 'video') {
    return content.durationSeconds === null ? '' : formatVideoDuration(content.durationSeconds);
  }
  if (content.pageCount !== null) return i18n.t('content.meta.pages', { count: content.pageCount });
  return formatStorageSize(content.sizeBytes);
}
