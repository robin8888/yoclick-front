import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getVideosGetQueryOptions } from '@/shared/api/generated/endpoints/videos/videos';
import type { VideoResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

const POLL_INTERVAL_MS = 5000;
/** Las pantallas que enseñan vídeos: al terminar de procesarse uno, sus datos se piden de nuevo. */
const SCREENS_WITH_VIDEOS = ['/team-profiles', '/routines', '/my-routines'];

function isQueryWithVideos(queryKey: readonly unknown[]): boolean {
  const key = JSON.stringify(queryKey);
  return SCREENS_WITH_VIDEOS.some((fragment) => key.includes(fragment));
}

/**
 * Mientras un vídeo se sube o se procesa, pregunta al servidor cada pocos segundos. Así el estado
 * se actualiza aunque la persona haya salido de la pantalla de subida: al terminar, el vídeo aparece solo.
 */
export function useVideoProcessingWatch(video: VideoResponseDto): void {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const isWaiting = video.status === 'uploading' || video.status === 'processing';
  const watch = useQuery({
    ...getVideosGetQueryOptions(centerId, video.id),
    enabled: isWaiting && centerId !== '',
    refetchInterval: POLL_INTERVAL_MS,
  });
  const hasFinished = watch.data?.status === 'ready' || watch.data?.status === 'failed';

  useEffect(() => {
    if (!hasFinished) return;
    void queryClient.invalidateQueries({
      predicate: (query) => isQueryWithVideos(query.queryKey),
    });
  }, [hasFinished, queryClient]);
}
