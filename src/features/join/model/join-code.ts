const MIN_JOIN_CODE_LENGTH = 4;
const MAX_JOIN_CODE_LENGTH = 16;
const JOIN_CODE_PATTERN = /^[A-Z0-9]+$/;

/** Los códigos se leen en voz alta o desde un cartel: se ignoran espacios y mayúsculas. */
export function normalizeJoinCode(rawCode: string): string {
  return rawCode.replaceAll(/\s+/g, '').toUpperCase();
}

export function isJoinCodeWellFormed(rawCode: string): boolean {
  const normalizedCode = normalizeJoinCode(rawCode);
  return (
    normalizedCode.length >= MIN_JOIN_CODE_LENGTH &&
    normalizedCode.length <= MAX_JOIN_CODE_LENGTH &&
    JOIN_CODE_PATTERN.test(normalizedCode)
  );
}

export const MAX_JOIN_CODE_INPUT_LENGTH = MAX_JOIN_CODE_LENGTH;
