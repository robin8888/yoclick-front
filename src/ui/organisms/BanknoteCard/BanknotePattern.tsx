import { StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const VIEW_WIDTH = 340;
const VIEW_HEIGHT = 170;
const WAVE_STEP = 20;
const WAVE_FAMILY_ROWS = 9;
const WAVE_AMPLITUDE = 9;
const WAVE_OPACITY = 0.3;
const WAVE_STROKE_WIDTH = 0.6;
const ROSETTE_CENTER_X = 262;
const ROSETTE_CENTER_Y = 85;
const ROSETTE_RINGS = 9;
const ROSETTE_RING_STEP = 7;
const ROSETTE_FIRST_RADIUS = 8;
const ROSETTE_OPACITY = 0.4;
const RAY_COUNT = 48;
const RAY_INNER_RADIUS = 14;
const RAY_OUTER_RADIUS = 70;
const RAY_OPACITY = 0.22;
const STROKE_WIDTH = 0.8;
const FULL_TURN = Math.PI + Math.PI;
const HALF = 0.5;

/** Una onda de lado a lado; dos familias con fase opuesta se cruzan y forman el entramado. */
function buildWavePath(rowY: number, isInverted: boolean): string {
  const direction = isInverted ? 1 : -1;
  const steps = Math.ceil(VIEW_WIDTH / WAVE_STEP);
  const curves = Array.from(
    { length: steps },
    (_, index) => `T ${String((index + 1) * WAVE_STEP)} ${String(rowY)}`,
  );
  const crest = rowY + direction * WAVE_AMPLITUDE;
  return `M 0 ${String(rowY)} Q ${String(WAVE_STEP * HALF)} ${String(crest)} ${String(WAVE_STEP)} ${String(rowY)} ${curves.join(' ')}`;
}

function buildWaveFamily(isInverted: boolean): string[] {
  return Array.from({ length: WAVE_FAMILY_ROWS }, (_, row) =>
    buildWavePath(((row + 1) * VIEW_HEIGHT) / (WAVE_FAMILY_ROWS + 1), isInverted),
  );
}

const WAVE_PATHS = [...buildWaveFamily(false), ...buildWaveFamily(true)];
const ROSETTE_RADII = Array.from(
  { length: ROSETTE_RINGS },
  (_, ring) => ROSETTE_FIRST_RADIUS + ring * ROSETTE_RING_STEP,
);
const RAYS = Array.from({ length: RAY_COUNT }, (_, ray) => {
  const angle = (ray / RAY_COUNT) * FULL_TURN;
  return {
    id: ray,
    x1: ROSETTE_CENTER_X + Math.cos(angle) * RAY_INNER_RADIUS,
    y1: ROSETTE_CENTER_Y + Math.sin(angle) * RAY_INNER_RADIUS,
    x2: ROSETTE_CENTER_X + Math.cos(angle) * RAY_OUTER_RADIUS,
    y2: ROSETTE_CENTER_Y + Math.sin(angle) * RAY_OUTER_RADIUS,
  };
});

interface BanknotePatternProps {
  /** El color de los trazos: el acento del tono del billete. */
  strokeColor: string;
}

function GuillocheWaves({ strokeColor }: Readonly<BanknotePatternProps>): React.JSX.Element {
  return (
    <>
      {WAVE_PATHS.map((pathData) => (
        <Path
          key={pathData}
          d={pathData}
          stroke={strokeColor}
          strokeWidth={WAVE_STROKE_WIDTH}
          strokeOpacity={WAVE_OPACITY}
          fill="none"
        />
      ))}
    </>
  );
}

function Rosette({ strokeColor }: Readonly<BanknotePatternProps>): React.JSX.Element {
  return (
    <>
      {RAYS.map(({ id, x1, y1, x2, y2 }) => (
        <Line
          key={id}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={WAVE_STROKE_WIDTH}
          strokeOpacity={RAY_OPACITY}
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
    </>
  );
}

/**
 * El fondo de seguridad del billete: entramado de ondas cruzadas (guilloche) y una roseta de
 * círculos y rayos a la derecha, bajo el logo del centro.
 */
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
      <GuillocheWaves strokeColor={strokeColor} />
      <Rosette strokeColor={strokeColor} />
    </Svg>
  );
}
