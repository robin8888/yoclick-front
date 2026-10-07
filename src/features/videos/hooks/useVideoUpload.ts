import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getTeamProfilesListQueryKey } from '@/shared/api/generated/endpoints/team-profiles/team-profiles';
import { getVideosGetPlanQueryKey } from '@/shared/api/generated/endpoints/videos/videos';
import type { StartVideoUploadRequestDto, VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { TusUploadError } from '@/shared/lib/tus-upload/upload-with-tus';

import { IDLE_UPLOAD_STAGE, type VideoUploadStage } from '../model/video-upload';
import { runVideoUploadFlow } from './run-video-upload-flow';
import { useActiveCenterId } from './useActiveCenterId';

export interface VideoUpload {
  stage: VideoUploadStage;
  isBusy: boolean;
  /** Abre la galería y sube lo elegido; `onReady` se llama cuando el vídeo está listo. */
  start: (onReady: (video: VideoResponseDto) => void) => void;
}

function describeFailure(error: unknown): string {
  if (error instanceof TusUploadError) return i18n.t('videos.upload.failed');
  return getApiErrorMessage(error);
}

/**
 * Todo el recorrido de subir un vídeo: elegirlo, reservar sitio, subirlo directo al servicio de
 * vídeo y esperar a que se procese. Un vídeo que ya está en el servicio no se pierde si la
 * pantalla se cierra: solo se deja de esperar.
 */
export function useVideoUpload(purpose: StartVideoUploadRequestDto['purpose']): VideoUpload {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<VideoUploadStage>(IDLE_UPLOAD_STAGE);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  async function run(onReady: (video: VideoResponseDto) => void): Promise<void> {
    const video = await runVideoUploadFlow({
      centerId,
      purpose,
      setStage,
      isCancelled: () => isUnmountedRef.current,
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getVideosGetPlanQueryKey(centerId) }),
      queryClient.invalidateQueries({ queryKey: getTeamProfilesListQueryKey(centerId) }),
    ]);
    if (video !== null) onReady(video);
  }

  return {
    stage,
    isBusy: stage.kind === 'uploading' || stage.kind === 'processing',
    start: (onReady) => {
      run(onReady).catch((error: unknown) => {
        setStage({ kind: 'failed', message: describeFailure(error) });
      });
    },
  };
}
