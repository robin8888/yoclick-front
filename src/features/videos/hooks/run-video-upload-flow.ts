import type { StartVideoUploadRequestDto, VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { IDLE_UPLOAD_STAGE, isVideoTooLarge, type VideoUploadStage } from '../model/video-upload';
import { uploadPickedVideo } from './upload-picked-video';
import { pickVideoFromLibrary } from './usePickVideo';

interface UploadFlowRequest {
  centerId: string;
  purpose: StartVideoUploadRequestDto['purpose'];
  setStage: (stage: VideoUploadStage) => void;
  isCancelled: () => boolean;
}

/**
 * Elegir, subir y esperar al procesado, dejando el avance en `setStage`. Devuelve el vídeo listo, o
 * `null` si se canceló, falló o no se eligió nada (el motivo del fallo ya queda en el estado).
 */
export async function runVideoUploadFlow(
  request: UploadFlowRequest,
): Promise<VideoResponseDto | null> {
  const picked = await pickVideoFromLibrary();
  if (picked === null) return null;
  if (isVideoTooLarge(picked.sizeBytes)) {
    request.setStage({ kind: 'failed', message: i18n.t('videos.upload.tooLarge') });
    return null;
  }
  request.setStage({ kind: 'uploading', uploadedPercent: 0 });
  const video = await uploadPickedVideo(
    { centerId: request.centerId, purpose: request.purpose, video: picked },
    {
      onUploadProgress: (uploadedPercent) => {
        request.setStage({ kind: 'uploading', uploadedPercent });
      },
      onProcessingStart: () => {
        request.setStage({ kind: 'processing' });
      },
      isCancelled: request.isCancelled,
    },
  );
  if (video?.status === 'failed') {
    request.setStage({ kind: 'failed', message: i18n.t('videos.upload.processingFailed') });
    return null;
  }
  if (video !== null) request.setStage(IDLE_UPLOAD_STAGE);
  return video;
}
