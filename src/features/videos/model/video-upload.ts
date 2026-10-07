import type { VideoResponseDto } from '@/shared/api/generated/model';

const BYTES_PER_MEGABYTE = 1_048_576;
const MAX_VIDEO_SIZE_MEGABYTES = 500;
const PERCENT = 100;
const MAX_TITLE_LENGTH = 120;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MEGABYTES * BYTES_PER_MEGABYTE;
export const VIDEO_POLL_INTERVAL_MS = 3000;
/** Diez minutos de procesado como mucho: pasado eso se da por fallido y se puede reintentar. */
export const MAX_VIDEO_POLL_COUNT = 200;

export type VideoUploadStage =
  | { kind: 'idle' }
  | { kind: 'uploading'; uploadedPercent: number }
  | { kind: 'processing' }
  | { kind: 'failed'; message: string };

export const IDLE_UPLOAD_STAGE: VideoUploadStage = { kind: 'idle' };

export function isVideoTooLarge(sizeBytes: number): boolean {
  return sizeBytes > MAX_VIDEO_SIZE_BYTES;
}

export function calculateUploadedPercent(uploadedBytes: number, totalBytes: number): number {
  if (totalBytes <= 0) return 0;
  return Math.min(PERCENT, Math.floor((uploadedBytes / totalBytes) * PERCENT));
}

/** El título del vídeo sale del nombre del fichero, sin la extensión: «sentadilla.mov» → «sentadilla». */
export function buildVideoTitle(fileName: string | null | undefined): string {
  const withoutExtension = (fileName ?? '').replace(/\.[^./\\]+$/, '').trim();
  return (withoutExtension === '' ? 'Vídeo' : withoutExtension).slice(0, MAX_TITLE_LENGTH);
}

interface WaitOptions {
  fetchVideo: () => Promise<VideoResponseDto>;
  wait: (milliseconds: number) => Promise<void>;
  isCancelled: () => boolean;
}

/**
 * Consulta el estado hasta que el vídeo está listo o ha fallado. Devuelve `null` si se cancela
 * (la pantalla se cerró) o se agota el tiempo.
 */
export async function waitUntilVideoIsProcessed(
  options: WaitOptions,
): Promise<VideoResponseDto | null> {
  for (let pollCount = 0; pollCount < MAX_VIDEO_POLL_COUNT; pollCount += 1) {
    if (options.isCancelled()) return null;
    const video = await options.fetchVideo();
    if (video.status === 'ready' || video.status === 'failed') return video;
    await options.wait(VIDEO_POLL_INTERVAL_MS);
  }
  return null;
}
