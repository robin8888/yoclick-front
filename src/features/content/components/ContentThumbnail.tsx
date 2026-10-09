import { Image } from 'expo-image';
import { View } from 'react-native';

import { buildVideoSource } from '@/features/videos';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';

import { createThumbnailStyle, THUMBNAIL_IMAGE_STYLE } from './Content.styles';

interface ContentThumbnailProps {
  kind: ContentResponseDto['kind'];
  thumbnailUrl: string | null;
  /** Grande en la cuadrícula del cliente; pequeña en la lista de la administración. */
  isLarge?: boolean;
}

/** La miniatura del vídeo o, si no la hay (un PDF, un vídeo sin procesar), el icono de su tipo. */
export function ContentThumbnail({
  kind,
  thumbnailUrl,
  isLarge = false,
}: Readonly<ContentThumbnailProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createThumbnailStyle(theme, isLarge)}>
      {thumbnailUrl === null ? null : (
        <Image
          source={buildVideoSource(thumbnailUrl)}
          style={THUMBNAIL_IMAGE_STYLE}
          contentFit="cover"
          accessible={false}
        />
      )}
      <View style={thumbnailUrl === null ? undefined : OVERLAY_STYLE}>
        <Icon
          name={kind === 'video' ? 'play' : 'file'}
          size={isLarge ? 'large' : 'inline'}
          color={thumbnailUrl === null ? 'ink2' : 'surface'}
        />
      </View>
    </View>
  );
}

const OVERLAY_STYLE = { position: 'absolute' } as const;
