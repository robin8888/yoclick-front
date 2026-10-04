import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import { Archivo_800ExtraBold } from '@expo-google-fonts/archivo/800ExtraBold';
import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';

import type { TypeStyle } from './theme.types';

type FontFamilyName = TypeStyle['fontFamily'];
type FontWeightName = TypeStyle['fontWeight'];

// Solo se importan los pesos que usa la escala tipográfica: importar el índice del paquete
// metería en el binario todas las variantes (cursivas incluidas).
export const FONT_FACE_ASSETS = {
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
};

export type FontFaceName = keyof typeof FONT_FACE_ASSETS;

interface AvailableFontFace {
  weight: number;
  faceName: FontFaceName;
}

// En React Native cada peso de una fuente personalizada es una «familia» distinta,
// por eso los estilos no usan `fontWeight` sino el nombre del fichero cargado.
// Tupla no vacía: cada familia tiene al menos una cara, así la búsqueda no necesita un caso de error.
const AVAILABLE_FONT_FACES: Readonly<
  Record<FontFamilyName, readonly [AvailableFontFace, ...AvailableFontFace[]]>
> = {
  display: [
    { weight: 700, faceName: 'Archivo_700Bold' },
    { weight: 800, faceName: 'Archivo_800ExtraBold' },
  ],
  sans: [
    { weight: 400, faceName: 'Figtree_400Regular' },
    { weight: 500, faceName: 'Figtree_500Medium' },
    { weight: 600, faceName: 'Figtree_600SemiBold' },
    { weight: 700, faceName: 'Figtree_700Bold' },
  ],
};

interface FontFaceRequest {
  fontFamily: FontFamilyName;
  fontWeight: FontWeightName;
}

/** Devuelve la cara cargada con el peso pedido o, si no existe, la más cercana. */
export function resolveFontFaceName({ fontFamily, fontWeight }: FontFaceRequest): FontFaceName {
  const requestedWeight = Number(fontWeight);
  const [firstFace, ...otherFaces] = AVAILABLE_FONT_FACES[fontFamily];
  const closestFace = otherFaces.reduce(
    (currentClosest, candidate) =>
      Math.abs(candidate.weight - requestedWeight) <
      Math.abs(currentClosest.weight - requestedWeight)
        ? candidate
        : currentClosest,
    firstFace,
  );
  return closestFace.faceName;
}
