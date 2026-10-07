import type { VideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';

/**
 * El motivo por el que el reproductor no puede con el vídeo, o `null` si no hay fallo. Sin esto un
 * fallo de red o de permisos se vería como un reproductor negro que no hace nada.
 */
export function usePlayerFailure(player: VideoPlayer): string | null {
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      setFailure(status === 'error' ? (error?.message ?? '') : null);
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  return failure;
}
