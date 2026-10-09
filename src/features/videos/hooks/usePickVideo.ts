import { launchImageLibraryAsync, VideoExportPreset } from 'expo-image-picker';

import type { PickedVideo } from './upload-picked-video';

const FALLBACK_MIME_TYPE = 'video/mp4';

/**
 * Abre la galería para elegir un vídeo. El selector del sistema no pide permiso: la app solo recibe
 * el vídeo que la persona elige. Devuelve `null` si cancela.
 */
export async function pickVideoFromLibrary(): Promise<PickedVideo | null> {
  const pickerResult = await launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: false,
    // iOS: el vídeo se exporta a 720p antes de subir. Los vídeos del iPhone son 4K o HEVC: pesan
    // mucho más, tardan más en subir y Bunny tarda más en procesarlos, y aquí nunca se ven a más de 720p.
    videoExportPreset: VideoExportPreset.H264_1280x720,
  });
  const asset = pickerResult.canceled ? undefined : pickerResult.assets[0];
  if (asset === undefined) return null;
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    sizeBytes: asset.fileSize ?? 0,
    mimeType: asset.mimeType ?? FALLBACK_MIME_TYPE,
  };
}
