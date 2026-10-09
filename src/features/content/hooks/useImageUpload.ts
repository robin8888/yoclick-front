import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { contentAddImage } from '@/shared/api/generated/endpoints/content/content';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import { pickPreparedPhoto } from '@/features/photos';
import { i18n } from '@/shared/i18n';

import { IMAGE_UPLOAD_TIMEOUT_MS } from '../model/image-upload';
import { useActiveCenterId } from './useActiveCenterId';

export type ImageUploadStage =
  { kind: 'idle' } | { kind: 'uploading' } | { kind: 'failed'; message: string };

const IDLE_STAGE: ImageUploadStage = { kind: 'idle' };

export interface ImageUpload {
  stage: ImageUploadStage;
  isBusy: boolean;
  /** Abre la galería, reduce la imagen elegida y la sube; avisa cuando ya está en la biblioteca. */
  start: (onUploaded: (content: ContentResponseDto) => void) => void;
}

/** El recorrido de subir una imagen: elegirla, reducirla y enviarla al servidor, que la guarda. */
export function useImageUpload(): ImageUpload {
  const centerId = useActiveCenterId();
  const [stage, setStage] = useState<ImageUploadStage>(IDLE_STAGE);

  async function run(onUploaded: (content: ContentResponseDto) => void): Promise<void> {
    const outcome = await pickPreparedPhoto('library', 'free');
    if (outcome.kind !== 'photo') return;
    setStage({ kind: 'uploading' });
    const content = await contentAddImage(
      centerId,
      outcome.blob,
      { title: i18n.t('content.upload.imageDefaultTitle') },
      { timeoutMs: IMAGE_UPLOAD_TIMEOUT_MS },
    );
    setStage(IDLE_STAGE);
    onUploaded(content);
  }

  return {
    stage,
    isBusy: stage.kind === 'uploading',
    start: (onUploaded) => {
      run(onUploaded).catch((error: unknown) => {
        setStage({ kind: 'failed', message: getApiErrorMessage(error) });
      });
    },
  };
}
