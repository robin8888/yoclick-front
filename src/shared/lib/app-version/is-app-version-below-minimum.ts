const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;
const VERSION_PART_COUNT = 3;

type VersionParts = readonly [number, number, number];

function parseVersion(version: string): VersionParts | null {
  const matchedParts = VERSION_PATTERN.exec(version.trim());
  if (matchedParts === null) return null;
  const [, major, minor, patch] = matchedParts;
  return [Number(major), Number(minor), Number(patch)];
}

/** Signo de la comparación numérica parte a parte: negativo si `first` es anterior a `second`. */
function compareVersionParts(first: VersionParts, second: VersionParts): number {
  for (let partIndex = 0; partIndex < VERSION_PART_COUNT; partIndex += 1) {
    const difference = (first[partIndex] ?? 0) - (second[partIndex] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/**
 * ¿La versión instalada es anterior a la mínima que exige la API (`X-Min-App-Version`)?
 * Una versión ilegible (cabecera corrupta) se trata como «no bloquear»: es preferible dejar
 * usar la app a bloquear a todos los usuarios por un valor mal formado.
 */
export function isAppVersionBelowMinimum(currentVersion: string, minimumVersion: string): boolean {
  const currentParts = parseVersion(currentVersion);
  const minimumParts = parseVersion(minimumVersion);
  if (currentParts === null || minimumParts === null) return false;
  return compareVersionParts(currentParts, minimumParts) < 0;
}
