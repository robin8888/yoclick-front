export type PhotoSource = 'camera' | 'library';

/** `square`: foto de perfil recortada en cuadrado; `free`: foto de galería con su forma original. */
export type PhotoShape = 'square' | 'free';

export const AVATAR_EDGE_PIXELS = 512;
export const GALLERY_MAX_EDGE_PIXELS = 1280;
export const PHOTO_JPEG_QUALITY = 0.8;
export const PHOTO_UPLOAD_TIMEOUT_MS = 60_000;

/** El tamaño al que se reduce una foto antes de subirla; nunca se agranda una más pequeña. */
export function resolveTargetSize(
  shape: PhotoShape,
  source: { width: number; height: number },
): { width: number; height: number } {
  if (shape === 'square') return { width: AVATAR_EDGE_PIXELS, height: AVATAR_EDGE_PIXELS };
  const longestEdge = Math.max(source.width, source.height);
  if (longestEdge <= GALLERY_MAX_EDGE_PIXELS) return { width: source.width, height: source.height };
  const scale = GALLERY_MAX_EDGE_PIXELS / longestEdge;
  return {
    width: Math.round(source.width * scale),
    height: Math.round(source.height * scale),
  };
}
