import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import type { VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { useOnScreenLeft } from '../hooks/useOnScreenLeft';
import { useVideoProcessingWatch } from '../hooks/useVideoProcessingWatch';
import { formatVideoDuration } from '../model/video-format';
import { buildVideoSource } from '../model/video-playback';
import { VideoPlayer } from './VideoPlayer';
import { VideoUploadProgress } from './VideoUploadProgress';
import { VideoStatusBadge } from './VideoStatusBadge';
import {
  createDurationChipStyle,
  createPlayBadgeStyle,
  createThumbnailFrameStyle,
  createVideoTitleStyle,
  STACK_STYLE,
  THUMBNAIL_STYLE,
} from './Videos.styles';

interface PlayableVideoProps {
  video: VideoResponseDto;
  /** Con título encima, para listas de vídeos; en una rutina el ejercicio ya lo dice. */
  shouldShowTitle?: boolean;
  /** Versión pequeña para cuadrículas de dos columnas (vídeos de técnica). */
  isCompact?: boolean;
}

function Thumbnail({
  video,
  thumbnailUrl,
  isCompact,
  onPress,
}: Readonly<{
  video: VideoResponseDto;
  thumbnailUrl: string;
  isCompact: boolean;
  onPress: () => void;
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('videos.player.playLabel', { title: video.title })}
      onPress={onPress}
      style={createThumbnailFrameStyle(theme, isCompact)}
    >
      <Image source={buildVideoSource(thumbnailUrl)} style={THUMBNAIL_STYLE} contentFit="cover" />
      <View style={createPlayBadgeStyle(theme, isCompact)}>
        <Icon name="play" color="onBrand" />
      </View>
      <View style={createVideoTitleStyle(theme)}>
        <Text variant="caption" color="surface" numberOfLines={1}>
          {video.title}
        </Text>
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

function VideoStage({
  video,
  isCompact,
}: Readonly<{ video: VideoResponseDto; isCompact: boolean }>): React.JSX.Element | null {
  const [isPlaying, setIsPlaying] = useState(false);
  const { playback } = video;
  // Al salir se descarta el reproductor: al volver se ve la miniatura y reproducir empieza limpio.
  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
  }, []);
  useOnScreenLeft(stopPlaying);

  if (playback === null) return null;
  if (isPlaying) return <VideoPlayer streamUrl={playback.streamUrl} title={video.title} />;
  return (
    <Thumbnail
      video={video}
      thumbnailUrl={playback.thumbnailUrl}
      isCompact={isCompact}
      onPress={() => {
        setIsPlaying(true);
      }}
    />
  );
}

/**
 * Un vídeo en una pantalla: miniatura con el botón de reproducir y, al tocarla, el reproductor.
 * Mientras no está listo (o si falló) solo dice en qué estado está.
 */
export function PlayableVideo({
  video,
  shouldShowTitle = false,
  isCompact = false,
}: Readonly<PlayableVideoProps>): React.JSX.Element {
  const isProcessing = video.status === 'uploading' || video.status === 'processing';
  useVideoProcessingWatch(video);

  return (
    <View style={STACK_STYLE}>
      {shouldShowTitle ? <Text variant="bodyStrong">{video.title}</Text> : null}
      {video.playback === null ? <VideoStatusBadge video={video} /> : null}
      {isProcessing ? <VideoUploadProgress stage={{ kind: 'processing' }} /> : null}
      <VideoStage video={video} isCompact={isCompact} />
    </View>
  );
}
