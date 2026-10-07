import { File, FileMode } from 'expo-file-system';

import { videosGet, videosStartUpload } from '@/shared/api/generated/endpoints/videos/videos';
import type { StartVideoUploadRequestDto, VideoResponseDto } from '@/shared/api/generated/model';
import { uploadWithTus } from '@/shared/lib/tus-upload/upload-with-tus';

import {
  buildVideoTitle,
  calculateUploadedPercent,
  waitUntilVideoIsProcessed,
} from '../model/video-upload';

export interface PickedVideo {
  uri: string;
  fileName: string | null;
  sizeBytes: number;
  mimeType: string;
}

interface UploadCallbacks {
  onUploadProgress: (uploadedPercent: number) => void;
  onProcessingStart: () => void;
  isCancelled: () => boolean;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/** Lee el fichero a trozos desde el disco: un vídeo de cientos de MB nunca está entero en memoria. */
function createChunkReader(uri: string): {
  readChunk: (offset: number, length: number) => Uint8Array;
  close: () => void;
} {
  const handle = new File(uri).open(FileMode.ReadOnly);
  return {
    readChunk: (offset, length) => {
      handle.offset = offset;
      return handle.readBytes(length);
    },
    close: () => {
      handle.close();
    },
  };
}

/**
 * Reserva el vídeo en el servidor, lo sube directamente al servicio de vídeo y espera a que esté
 * procesado. Devuelve `null` si la pantalla se cerró por el camino.
 */
export async function uploadPickedVideo(
  request: {
    centerId: string;
    purpose: StartVideoUploadRequestDto['purpose'];
    video: PickedVideo;
  },
  callbacks: UploadCallbacks,
): Promise<VideoResponseDto | null> {
  const { video } = request;
  const title = buildVideoTitle(video.fileName);
  const started = await videosStartUpload(request.centerId, {
    title,
    sizeBytes: video.sizeBytes,
    purpose: request.purpose,
  });
  const reader = createChunkReader(video.uri);
  try {
    await uploadWithTus({
      endpoint: started.upload.endpoint,
      headers: started.upload.headers,
      metadata: { filetype: video.mimeType, title },
      totalBytes: video.sizeBytes,
      readChunk: reader.readChunk,
      onProgress: (uploadedBytes) => {
        callbacks.onUploadProgress(calculateUploadedPercent(uploadedBytes, video.sizeBytes));
      },
    });
  } finally {
    reader.close();
  }
  callbacks.onProcessingStart();
  return waitUntilVideoIsProcessed({
    fetchVideo: () => videosGet(request.centerId, started.video.id),
    wait,
    isCancelled: callbacks.isCancelled,
  });
}
