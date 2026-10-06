import Svg, { Path } from 'react-native-svg';

import { buildHueWheelColors } from '../model/color-grid';

interface ColorWheelIconProps {
  size: number;
}

const WHEEL_COLORS = buildHueWheelColors();
const FULL_CIRCLE_DEGREES = 360;
const HALF_CIRCLE_DEGREES = 180;
const DEGREES_PER_WEDGE = FULL_CIRCLE_DEGREES / WHEEL_COLORS.length;
const RADIANS_PER_DEGREE = Math.PI / HALF_CIRCLE_DEGREES;
const WEDGE_OVERLAP_DEGREES = 0.6;
// Los gajos arrancan arriba (las 12 en punto), no a las 3 como el arco SVG por defecto.
const START_ANGLE_DEGREES = -90;
const VIEW_BOX_SIZE = 100;
const HALF = 0.5;
const CENTER = VIEW_BOX_SIZE * HALF;

function buildWedgePath(wedgeIndex: number): string {
  const startAngle = (START_ANGLE_DEGREES + wedgeIndex * DEGREES_PER_WEDGE) * RADIANS_PER_DEGREE;
  const endAngle = startAngle + (DEGREES_PER_WEDGE + WEDGE_OVERLAP_DEGREES) * RADIANS_PER_DEGREE;
  const startX = CENTER + CENTER * Math.cos(startAngle);
  const startY = CENTER + CENTER * Math.sin(startAngle);
  const endX = CENTER + CENTER * Math.cos(endAngle);
  const endY = CENTER + CENTER * Math.sin(endAngle);
  return `M${String(CENTER)} ${String(CENTER)} L${String(startX)} ${String(startY)} A${String(CENTER)} ${String(CENTER)} 0 0 1 ${String(endX)} ${String(endY)} Z`;
}

/** Círculo cromático de doce gajos: el icono del selector de color. Es decorativo. */
export function ColorWheelIcon({ size }: Readonly<ColorWheelIconProps>): React.JSX.Element {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${String(VIEW_BOX_SIZE)} ${String(VIEW_BOX_SIZE)}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {WHEEL_COLORS.map((wedgeColor, wedgeIndex) => (
        <Path key={wedgeColor} d={buildWedgePath(wedgeIndex)} fill={wedgeColor} />
      ))}
    </Svg>
  );
}
