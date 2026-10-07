import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { formatVideoDuration } from '../model/video-format';
import { VideoPlayer } from './VideoPlayer';
import { VideoStatusBadge } from './VideoStatusBadge';
import {
  createDurationChipStyle,
  createPlayBadgeStyle,
  createThumbnailFrameStyle,
  STACK_STYLE,
  THUMBNAIL_STYLE,
} from './Videos.styles';

interface PlayableVideoProps {
  video: VideoResponseDto;
  /** Con título encima, para listas de vídeos; en una rutina el ejercicio ya lo dice. */
  shouldShowTitle?: boolean;
}

function Thumbnail({
  video,
  thumbnailUrl,
  onPress,
}: Readonly<{
  video: VideoResponseDto;
  thumbnailUrl: string;
  onPress: () => void;
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('videos.player.playLabel', { title: video.title })}
      onPress={onPress}
      style={createThumbnailFrameStyle(theme)}
    >
      <Image source={{ uri: thumbnailUrl }} style={THUMBNAIL_STYLE} contentFit="cover" />
      <View style={createPlayBadgeStyle(theme)}>
        <Icon name="play" color="onBrand" />
      </View>
      {video.durationSeconds === null ? null : (
        <View style={createDurationChipStyle(theme)}>
          <Text variant="caption" color="surface">
            {formatVideoDuration(video.durationSeconds)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Un vídeo en una pantalla: miniatura con el botón de reproducir y, al tocarla, el reproductor.
 * Mientras no está listo (o si falló) solo dice en qué estado está.
 */
export function PlayableVideo({
  video,
  shouldShowTitle = false,
}: Readonly<PlayableVideoProps>): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false);
  const { playback } = video;

  return (
    <View style={STACK_STYLE}>
      {shouldShowTitle ? <Text variant="bodyStrong">{video.title}</Text> : null}
      {playback === null ? <VideoStatusBadge video={video} /> : null}
      {playback !== null && isPlaying ? (
        <VideoPlayer streamUrl={playback.streamUrl} title={video.title} />
      ) : null}
      {playback !== null && !isPlaying ? (
        <Thumbnail
          video={video}
          thumbnailUrl={playback.thumbnailUrl}
          onPress={() => {
            setIsPlaying(true);
          }}
        />
      ) : null}
    </View>
  );
}
