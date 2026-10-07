import { useVideoPlayer, VideoView } from 'expo-video';

import { i18n } from '@/shared/i18n';

import { PLAYER_STYLE } from './Videos.styles';

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
}

/** Reproduce el streaming adaptativo del vídeo; los controles son los del sistema, accesibles de serie. */
export function VideoPlayer({ streamUrl, title }: Readonly<VideoPlayerProps>): React.JSX.Element {
  const player = useVideoPlayer(streamUrl, (videoPlayer) => {
    videoPlayer.play();
  });

  return (
    <VideoView
      player={player}
      style={PLAYER_STYLE}
      nativeControls
      fullscreenOptions={{ enable: true }}
      accessibilityLabel={i18n.t('videos.player.playerLabel', { title })}
    />
  );
}
