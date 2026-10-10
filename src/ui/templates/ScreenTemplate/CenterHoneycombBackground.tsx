import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';

import {
  buildHoneycombTile,
  centerHoneycomb,
  resolveScreenBackgroundPaint,
  useCenterAppearance,
  useTheme,
} from '@/shared/theme';

const HONEYCOMB_ID = 'centerHoneycomb';
const GRADIENT_ID = 'centerBackgroundGradient';
const HONEYCOMB_TILE = buildHoneycombTile(centerHoneycomb.cellRadius);

interface HoneycombPatternProps {
  strokeColor: string;
  lineOpacity: number;
}

function HoneycombPattern({
  strokeColor,
  lineOpacity,
}: Readonly<HoneycombPatternProps>): React.JSX.Element {
  return (
    <Pattern
      id={HONEYCOMB_ID}
      width={HONEYCOMB_TILE.width}
      height={HONEYCOMB_TILE.height}
      patternUnits="userSpaceOnUse"
    >
      <Path
        d={HONEYCOMB_TILE.pathData}
        fill="none"
        stroke={strokeColor}
        strokeOpacity={lineOpacity}
        strokeWidth={centerHoneycomb.lineWidth}
      />
    </Pattern>
  );
}

/**
 * Fondo de las pantallas de un centro: el degradado Premium (si lo hay) y la colmena, con el color
 * de marca o el que eligió el propietario. Es decoración, el lector de pantalla la ignora.
 */
export function CenterHoneycombBackground(): React.JSX.Element {
  const theme = useTheme();
  const appearance = useCenterAppearance();
  const backgroundPaint = resolveScreenBackgroundPaint(appearance);
  const hasCustomHive = appearance.hiveColor !== null;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      pointerEvents="none"
      aria-hidden
    >
      <Defs>
        {backgroundPaint.kind === 'gradient' ? (
          <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={backgroundPaint.startColor} />
            <Stop offset="1" stopColor={backgroundPaint.endColor} />
          </LinearGradient>
        ) : null}
        <HoneycombPattern
          strokeColor={appearance.hiveColor ?? theme.colors.brand}
          lineOpacity={
            hasCustomHive ? centerHoneycomb.customLineOpacity : centerHoneycomb.lineOpacity
          }
        />
      </Defs>
      {backgroundPaint.kind === 'gradient' ? (
        <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
      ) : null}
      <Rect width="100%" height="100%" fill={`url(#${HONEYCOMB_ID})`} />
    </Svg>
  );
}
