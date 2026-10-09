import { View } from 'react-native';

import type { ContentDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { useActiveCenterName } from '../hooks/useActiveCenterName';
import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { describeContentLevel } from '../model/content-levels';
import { describeContentMeta } from '../model/content-meta';
import { ROW_STYLE, STACK_STYLE } from './Content.styles';

const MEDIA_DESCRIPTION_KEYS = {
  video: 'content.media.videoDescription',
  pdf: 'content.media.pdfDescription',
  image: 'content.media.imageDescription',
} as const;

/** Título, nivel, necesidad, duración o páginas y la descripción corta de lo que se está viendo. */
export function MediaDetails({
  content,
  isTitleHidden = false,
}: Readonly<{
  content: ContentDetailResponseDto;
  /** El PDF ya lleva su nombre en la hoja: aquí no se repite. */
  isTitleHidden?: boolean;
}>): React.JSX.Element {
  const centerName = useActiveCenterName();
  const { levelWords } = useContentVocabulary();
  const meta = content.kind === 'video' ? describeContentMeta(content) : '';
  const descriptionKey = MEDIA_DESCRIPTION_KEYS[content.kind];

  return (
    <View style={STACK_STYLE}>
      {isTitleHidden ? null : <Text variant="titleMd">{content.title}</Text>}
      <View style={ROW_STYLE}>
        {content.level === null ? null : (
          <Badge tone="brand" label={describeContentLevel(content.level, levelWords)} />
        )}
        {content.need === null ? null : <Badge label={content.need} />}
        {meta === '' ? null : (
          <Text variant="caption" color="ink2">
            {meta}
          </Text>
        )}
      </View>
      <Text>{i18n.t(descriptionKey, { center: centerName })}</Text>
    </View>
  );
}
