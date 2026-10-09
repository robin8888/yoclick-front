import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import {
  contentAddVideo,
  getContentListQueryKey,
} from '@/shared/api/generated/endpoints/content/content';
import { useVideoUpload, type VideoUpload } from '@/features/videos';

import { useActiveCenterId } from './useActiveCenterId';
import { usePdfUpload, type PdfUpload } from './usePdfUpload';

export interface ContentUpload {
  video: VideoUpload;
  pdf: PdfUpload;
  isBusy: boolean;
  /** Un vídeo ya subido que no se pudo poner en la biblioteca (el vídeo en sí no se pierde). */
  libraryErrorMessage: string | null;
  uploadVideo: () => void;
  uploadPdf: () => void;
}

/**
 * Subir a la biblioteca: un vídeo (directo al servicio de vídeo, luego se añade a la biblioteca) o un
 * PDF (se envía al servidor, que lo guarda). El título sale del nombre del fichero.
 */
export function useUploadContent(options: {
  /** Se llama con la pieza recién subida, para que la persona le ponga título y etiqueta. */
  onContentAdded: (content: ContentResponseDto) => void;
}): ContentUpload {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const video = useVideoUpload('exercise');
  const pdf = usePdfUpload();
  const refreshLibrary = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: getContentListQueryKey(centerId) });
  const addVideo = useMutation({
    mutationFn: (readyVideo: { id: string; title: string }) =>
      contentAddVideo(centerId, { videoId: readyVideo.id, title: readyVideo.title }),
    onSuccess: async (content) => {
      await refreshLibrary();
      options.onContentAdded(content);
    },
  });

  return {
    video,
    pdf,
    isBusy: video.isBusy || pdf.isBusy || addVideo.isPending,
    libraryErrorMessage: addVideo.isError ? getApiErrorMessage(addVideo.error) : null,
    uploadVideo: () => {
      video.start((readyVideo) => {
        addVideo.mutate(readyVideo);
      });
    },
    uploadPdf: () => {
      pdf.start((content) => {
        void refreshLibrary().then(() => {
          options.onContentAdded(content);
        });
      });
    },
  };
}
