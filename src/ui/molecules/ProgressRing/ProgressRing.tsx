import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/shared/theme';

interface ProgressRingProps {
  /** De 0 a 1; se limita a ese rango. */
  progress: number;
  size?: number;
  /** Para el lector de pantalla («3 de 4 sesiones»): el anillo solo no dice nada. */
  accessibilityLabel: string;
}

const DEFAULT_RING_SIZE = 72;
const RING_STROKE_WIDTH = 9;
const HALF = 0.5;
const TWO = 2;
const FULL_CIRCLE_RADIANS = TWO * Math.PI;
// El arco SVG arranca a las 3 en punto; un cuarto de vuelta atrás lo lleva arriba.
const RING_START_ROTATION = { transform: [{ rotate: '-90deg' }] } as const;

/** Anillo de progreso: pista neutra y arco del color del centro que arranca arriba. */
export function ProgressRing({
  progress,
  size = DEFAULT_RING_SIZE,
  accessibilityLabel,
}: Readonly<ProgressRingProps>): React.JSX.Element {
  const theme = useTheme();
  const radius = (size - RING_STROKE_WIDTH) * HALF;
  const circumference = FULL_CIRCLE_RADIANS * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View accessible role="img" aria-label={accessibilityLabel}>
      <Svg width={size} height={size} style={RING_START_ROTATION}>
        <Circle
          cx={size * HALF}
          cy={size * HALF}
          r={radius}
          stroke={theme.colors.surface2}
          strokeWidth={RING_STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={size * HALF}
          cy={size * HALF}
          r={radius}
          stroke={theme.colors.brand}
          strokeWidth={RING_STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${String(circumference * clampedProgress)} ${String(circumference)}`}
          fill="none"
        />
      </Svg>
    </View>
  );
}
