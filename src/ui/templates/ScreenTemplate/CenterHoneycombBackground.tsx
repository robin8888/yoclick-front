import { StyleSheet } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { buildHoneycombTile, centerHoneycomb, useTheme } from '@/shared/theme';

const HONEYCOMB_ID = 'centerHoneycomb';
const HONEYCOMB_TILE = buildHoneycombTile(centerHoneycomb.cellRadius);

/** Colmena de fondo con el color de marca del centro; es decoración, el lector de pantalla la ignora. */
export function CenterHoneycombBackground(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      pointerEvents="none"
      aria-hidden
    >
      <Defs>
        <Pattern
          id={HONEYCOMB_ID}
          width={HONEYCOMB_TILE.width}
          height={HONEYCOMB_TILE.height}
          patternUnits="userSpaceOnUse"
        >
          <Path
            d={HONEYCOMB_TILE.pathData}
            fill="none"
            stroke={theme.colors.brand}
            strokeOpacity={centerHoneycomb.lineOpacity}
            strokeWidth={centerHoneycomb.lineWidth}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${HONEYCOMB_ID})`} />
    </Svg>
  );
}
