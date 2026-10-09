import { Pressable, View } from 'react-native';

import type { ContentResponseDto } from '@/shared/api/generated/model';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { describeContentMeta } from '../model/content-meta';
import { buildMediaCaption } from '../model/media-caption';
import {
  createDurationChipStyle,
  createMediaBodyStyle,
  createMediaCardStyle,
} from './Content.styles';
import { ContentThumbnail } from './ContentThumbnail';

interface ContentMediaCardProps {
  content: ContentResponseDto;
  levelWords: readonly string[];
  onPress: () => void;
}

/** Una tarjeta de la cuadrícula del cliente: miniatura con su duración o páginas y, debajo, de qué va. */
export function ContentMediaCard({
  content,
  levelWords,
  onPress,
}: Readonly<ContentMediaCardProps>): React.JSX.Element {
  const theme = useTheme();
  const meta = describeContentMeta(content);
  const caption = buildMediaCaption(content, levelWords);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${content.title}. ${caption}`}
      onPress={onPress}
      style={createMediaCardStyle(theme)}
    >
      <View>
        <ContentThumbnail kind={content.kind} thumbnailUrl={content.thumbnailUrl} isLarge />
        {meta === '' ? null : (
          <View style={createDurationChipStyle(theme)}>
            <Text variant="caption" color="surface">
              {meta}
            </Text>
          </View>
        )}
      </View>
      <View style={createMediaBodyStyle(theme)}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {content.title}
        </Text>
        <Text variant="caption" color="ink2" numberOfLines={2}>
          {caption}
        </Text>
      </View>
    </Pressable>
  );
}
