import { StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const VIEW_WIDTH = 340;
const VIEW_HEIGHT = 170;
const WAVE_ROWS = 8;
const WAVE_STEP = 20;
const WAVE_AMPLITUDE = 6;
const WAVE_OPACITY = 0.32;
const ROSETTE_OPACITY = 0.38;
const ROSETTE_CENTER_X = 272;
const ROSETTE_CENTER_Y = 85;
const ROSETTE_RINGS = 7;
const ROSETTE_RING_STEP = 9;
const ROSETTE_FIRST_RADIUS = 9;
const STROKE_WIDTH = 0.9;
const HALF = 0.5;

/** Una línea ondulada de lado a lado, como la fina rejilla de seguridad de un billete. */
function buildWavePath(rowY: number): string {
  const steps = Math.ceil(VIEW_WIDTH / WAVE_STEP);
  const curves = Array.from(
    { length: steps },
    (_, index) => `T ${String((index + 1) * WAVE_STEP)} ${String(rowY)}`,
  );
  return `M 0 ${String(rowY)} Q ${String(WAVE_STEP * HALF)} ${String(rowY - WAVE_AMPLITUDE)} ${String(WAVE_STEP)} ${String(rowY)} ${curves.join(' ')}`;
}

const WAVE_PATHS = Array.from({ length: WAVE_ROWS }, (_, row) =>
  buildWavePath(((row + 1) * VIEW_HEIGHT) / (WAVE_ROWS + 1)),
);
const ROSETTE_RADII = Array.from(
  { length: ROSETTE_RINGS },
  (_, ring) => ROSETTE_FIRST_RADIUS + ring * ROSETTE_RING_STEP,
);

interface BanknotePatternProps {
  /** El color de los trazos: el acento del tono del billete. */
  strokeColor: string;
}

/** El fondo de seguridad del billete: rejilla ondulada y una roseta de círculos a la derecha. */
export function BanknotePattern({
  strokeColor,
}: Readonly<BanknotePatternProps>): React.JSX.Element {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      {WAVE_PATHS.map((pathData) => (
        <Path
          key={pathData}
          d={pathData}
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          strokeOpacity={WAVE_OPACITY}
          fill="none"
        />
      ))}
      {ROSETTE_RADII.map((radius) => (
        <Circle
          key={radius}
          cx={ROSETTE_CENTER_X}
          cy={ROSETTE_CENTER_Y}
          r={radius}
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          strokeOpacity={ROSETTE_OPACITY}
          fill="none"
        />
      ))}
    </Svg>
  );
}
