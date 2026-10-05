const SQRT_OF_THREE = Math.sqrt(3);
const TILE_HEIGHT_IN_RADII = 3;
const HALF = 0.5;
const DECIMAL_PLACES = 2;

export interface HoneycombTile {
  width: number;
  height: number;
  /** Trazo (`d` de un `<Path>`) de un tile que, repetido, dibuja un panal de celdas hexagonales. */
  pathData: string;
}

function formatCoordinate(coordinate: number): string {
  return Number(coordinate.toFixed(DECIMAL_PLACES)).toString();
}

function point(horizontal: number, vertical: number): string {
  return `${formatCoordinate(horizontal)} ${formatCoordinate(vertical)}`;
}

/**
 * Tile de un panal con celdas de vértice arriba. Contiene una celda entera y la arista vertical que
 * comparte con la fila de abajo; el resto de aristas las completan los tiles vecinos al repetirse.
 */
export function buildHoneycombTile(cellRadius: number): HoneycombTile {
  const width = SQRT_OF_THREE * cellRadius;
  const centerX = width * HALF;
  const upperY = cellRadius * HALF;
  const lowerY = cellRadius * (1 + HALF);
  const bottomY = cellRadius * 2;
  const height = cellRadius * TILE_HEIGHT_IN_RADII;
  const cellPath = [
    `M ${point(0, upperY)} L ${point(centerX, 0)} L ${point(width, upperY)}`,
    `L ${point(width, lowerY)} L ${point(centerX, bottomY)} L ${point(0, lowerY)} Z`,
  ].join(' ');

  return {
    width,
    height,
    pathData: `${cellPath} M ${point(centerX, bottomY)} L ${point(centerX, height)}`,
  };
}
