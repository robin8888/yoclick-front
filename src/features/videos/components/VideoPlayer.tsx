import { useVideoPlayer, VideoView } from 'expo-video';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { usePlayerFailure } from '../hooks/usePlayerFailure';
import { buildVideoSource } from '../model/video-playback';
import { PLAYER_STYLE, STACK_STYLE } from './Videos.styles';

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
}

/** Reproduce el streaming adaptativo del vídeo; los controles son los del sistema, accesibles de serie. */
export function VideoPlayer({ streamUrl, title }: Readonly<VideoPlayerProps>): React.JSX.Element {
  const player = useVideoPlayer(buildVideoSource(streamUrl), (videoPlayer) => {
    videoPlayer.play();
  });
  const failure = usePlayerFailure(player);

  return (
    <View style={STACK_STYLE}>
      <VideoView
        player={player}
        style={PLAYER_STYLE}
        nativeControls
        fullscreenOptions={{ enable: true }}
        accessibilityLabel={i18n.t('videos.player.playerLabel', { title })}
      />
      {failure === null ? null : (
        <View accessible accessibilityRole="alert">
          <Text color="danger">{i18n.t('videos.player.playbackFailed')}</Text>
          {failure === '' ? null : (
            <Text variant="caption" color="ink2">
              {failure}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
