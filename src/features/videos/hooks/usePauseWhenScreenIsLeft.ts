import { useFocusEffect } from 'expo-router';
import type { VideoPlayer } from 'expo-video';
import { useCallback } from 'react';

/**
 * Las pantallas que se dejan atrás (otra pestaña, otra ruta apilada) siguen montadas: sin esto el
 * vídeo seguiría sonando en una pantalla que ya no se ve.
 */
export function usePauseWhenScreenIsLeft(player: VideoPlayer): void {
  useFocusEffect(
    useCallback(
      () => () => {
        player.pause();
      },
      [player],
    ),
  );
}
