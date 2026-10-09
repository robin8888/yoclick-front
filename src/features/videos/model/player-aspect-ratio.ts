const LANDSCAPE_WIDTH_UNITS = 16;
const LANDSCAPE_HEIGHT_UNITS = 9;
const PORTRAIT_WIDTH_UNITS = 3;
const PORTRAIT_HEIGHT_UNITS = 4;

export const DEFAULT_PLAYER_ASPECT_RATIO = LANDSCAPE_WIDTH_UNITS / LANDSCAPE_HEIGHT_UNITS;
/** El vídeo vertical más alto que se dibuja entero: 3:4; uno más estrecho lleva bandas a los lados. */
const MIN_PLAYER_ASPECT_RATIO = PORTRAIT_WIDTH_UNITS / PORTRAIT_HEIGHT_UNITS;

/**
 * La proporción del marco del reproductor según el vídeo: uno vertical ocupa casi todo el ancho en
 * vez de verse pequeño dentro de un marco apaisado, sin pasarse de alto en la pantalla.
 */
export function resolvePlayerAspectRatio(size: { width: number; height: number } | null): number {
  if (size === null || size.width <= 0 || size.height <= 0) return DEFAULT_PLAYER_ASPECT_RATIO;
  const videoRatio = size.width / size.height;
  return Math.min(DEFAULT_PLAYER_ASPECT_RATIO, Math.max(MIN_PLAYER_ASPECT_RATIO, videoRatio));
}
