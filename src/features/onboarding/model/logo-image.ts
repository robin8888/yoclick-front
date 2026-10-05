// Mismo tope que la API (`MAX_LOGO_BYTES`): se comprueba aquí para avisar antes de subir.
export const MAX_LOGO_BYTES = 716_800;
/** Lado del cuadrado al que se reduce el logo: de sobra para un avatar y ligero para subir. */
export const LOGO_EDGE_PIXELS = 512;

const BASE64_BLOCK_CHARACTERS = 4;
const BYTES_PER_BASE64_BLOCK = 3;

const DOUBLE_PADDING = '==';
const SINGLE_PADDING = '=';

function countBase64Padding(dataBase64: string): number {
  if (dataBase64.endsWith(DOUBLE_PADDING)) return DOUBLE_PADDING.length;
  return dataBase64.endsWith(SINGLE_PADDING) ? SINGLE_PADDING.length : 0;
}

/** Bytes que ocupa lo codificado en base64, sin decodificarlo. */
export function estimateDecodedBase64Bytes(dataBase64: string): number {
  const paddingLength = countBase64Padding(dataBase64);
  return (dataBase64.length / BASE64_BLOCK_CHARACTERS) * BYTES_PER_BASE64_BLOCK - paddingLength;
}

export function isLogoSmallEnough(dataBase64: string): boolean {
  return estimateDecodedBase64Bytes(dataBase64) <= MAX_LOGO_BYTES;
}
