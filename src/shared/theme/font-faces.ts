import { Outfit_400Regular } from '@expo-google-fonts/outfit/400Regular';
import { Outfit_500Medium } from '@expo-google-fonts/outfit/500Medium';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { Outfit_800ExtraBold } from '@expo-google-fonts/outfit/800ExtraBold';

import type { TypeStyle } from './theme.types';

type FontFamilyName = TypeStyle['fontFamily'];
type FontWeightName = TypeStyle['fontWeight'];

// Solo se importan los pesos que usa la escala tipográfica: importar el índice del paquete
// metería en el binario todas las variantes (cursivas incluidas).
export const FONT_FACE_ASSETS = {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
};

export type FontFaceName = keyof typeof FONT_FACE_ASSETS;

interface AvailableFontFace {
  weight: number;
  faceName: FontFaceName;
}

// El logo está rotulado en una geométrica redondeada; Outfit es la que más se le parece.
// Titulares y texto comparten familia para que toda la app suene a la marca.
const OUTFIT_FONT_FACES = [
  { weight: 400, faceName: 'Outfit_400Regular' },
  { weight: 500, faceName: 'Outfit_500Medium' },
  { weight: 600, faceName: 'Outfit_600SemiBold' },
  { weight: 700, faceName: 'Outfit_700Bold' },
  { weight: 800, faceName: 'Outfit_800ExtraBold' },
] as const satisfies readonly [AvailableFontFace, ...AvailableFontFace[]];

// En React Native cada peso de una fuente personalizada es una «familia» distinta,
// por eso los estilos no usan `fontWeight` sino el nombre del fichero cargado.
// Tupla no vacía: cada familia tiene al menos una cara, así la búsqueda no necesita un caso de error.
const AVAILABLE_FONT_FACES: Readonly<
  Record<FontFamilyName, readonly [AvailableFontFace, ...AvailableFontFace[]]>
> = {
  display: OUTFIT_FONT_FACES,
  sans: OUTFIT_FONT_FACES,
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
