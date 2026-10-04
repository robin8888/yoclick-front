import { useFonts } from 'expo-font';

import { FONT_FACE_ASSETS } from './font-faces';

/**
 * Carga Archivo y Figtree. Si la carga falla se considera «lista» igualmente: es mejor mostrar
 * la app con la fuente del sistema que dejar al usuario en el splash para siempre.
 */
export function useAppFonts(): { areFontsReady: boolean } {
  const [hasLoadedFonts, fontLoadingError] = useFonts(FONT_FACE_ASSETS);
  return { areFontsReady: hasLoadedFonts || fontLoadingError !== null };
}
