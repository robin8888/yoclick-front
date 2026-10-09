import type { VideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';

import {
  DEFAULT_PLAYER_ASPECT_RATIO,
  resolvePlayerAspectRatio,
} from '../model/player-aspect-ratio';

/**
 * La proporción del marco que le va al vídeo. Las medidas llegan por distintos caminos según el
 * sistema y el tipo de streaming (pista activa, metadatos de la fuente o al estar listo para
 * reproducir), así que se escuchan todos y se usa el primero que las traiga.
 */
export function usePlayerAspectRatio(player: VideoPlayer): number {
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_PLAYER_ASPECT_RATIO);

  useEffect(() => {
    const update = (size: { width: number; height: number } | null | undefined): void => {
      if (size === null || size === undefined || size.width <= 0 || size.height <= 0) return;
      setAspectRatio(resolvePlayerAspectRatio(size));
    };
    update(player.videoTrack?.size);
    const subscriptions = [
      player.addListener('videoTrackChange', ({ videoTrack }) => {
        update(videoTrack?.size);
      }),
      player.addListener('sourceLoad', ({ availableVideoTracks }) => {
        update(availableVideoTracks[0]?.size);
      }),
      player.addListener('statusChange', () => {
        update(player.videoTrack?.size);
      }),
    ];
    return () => {
      subscriptions.forEach((subscription) => {
        subscription.remove();
      });
    };
  }, [player]);

  return aspectRatio;
}
