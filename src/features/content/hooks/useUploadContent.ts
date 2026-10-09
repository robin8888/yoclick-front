import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import {
  contentAddVideo,
  getContentListQueryKey,
} from '@/shared/api/generated/endpoints/content/content';
import { useVideoUpload, type VideoUpload } from '@/features/videos';

import { useActiveCenterId } from './useActiveCenterId';
import { useImageUpload, type ImageUpload } from './useImageUpload';
import { usePdfUpload, type PdfUpload } from './usePdfUpload';

export interface ContentUpload {
  video: VideoUpload;
  pdf: PdfUpload;
  image: ImageUpload;
  isBusy: boolean;
  /** Un vídeo ya subido que no se pudo poner en la biblioteca (el vídeo en sí no se pierde). */
  libraryErrorMessage: string | null;
  uploadVideo: () => void;
  uploadPdf: () => void;
  uploadImage: () => void;
}

/** Pone en la biblioteca un vídeo ya subido y procesado; el vídeo en sí no se pierde si esto falla. */
function useAddVideoToLibrary(
  refreshLibrary: () => Promise<void>,
  onContentAdded: (content: ContentResponseDto) => void,
): {
  add: (readyVideo: { id: string; title: string }) => void;
  isRunning: boolean;
  errorMessage: string | null;
} {
  const centerId = useActiveCenterId();
  const mutation = useMutation({
    mutationFn: (readyVideo: { id: string; title: string }) =>
      contentAddVideo(centerId, { videoId: readyVideo.id, title: readyVideo.title }),
    onSuccess: async (content) => {
      await refreshLibrary();
      onContentAdded(content);
    },
  });

  return {
    add: (readyVideo) => {
      mutation.mutate(readyVideo);
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

/**
 * Subir a la biblioteca: un vídeo (directo al servicio de vídeo, luego se añade a la biblioteca), un
 * PDF o una imagen (se envían al servidor, que los guarda). El título se propone y luego se edita.
 */
export function useUploadContent(options: {
  /** Se llama con la pieza recién subida, para que la persona le ponga título y etiqueta. */
  onContentAdded: (content: ContentResponseDto) => void;
}): ContentUpload {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const video = useVideoUpload('exercise');
  const pdf = usePdfUpload();
  const image = useImageUpload();
  const refreshLibrary = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: getContentListQueryKey(centerId) });
  const addVideo = useAddVideoToLibrary(refreshLibrary, options.onContentAdded);
  const addFile = (content: ContentResponseDto): void => {
    void refreshLibrary().then(() => {
      options.onContentAdded(content);
    });
  };

  return {
    video,
    pdf,
    image,
    isBusy: video.isBusy || pdf.isBusy || image.isBusy || addVideo.isRunning,
    libraryErrorMessage: addVideo.errorMessage,
    uploadVideo: () => {
      video.start(addVideo.add);
    },
    uploadPdf: () => {
      pdf.start(addFile);
    },
    uploadImage: () => {
      image.start(addFile);
    },
  };
}
