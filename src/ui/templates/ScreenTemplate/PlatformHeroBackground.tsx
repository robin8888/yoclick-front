import { StyleSheet } from 'react-native';
import Svg, { Defs, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { buildHoneycombTile, platformHeroGradient, platformHeroHoneycomb } from '@/shared/theme';

const GRADIENT_ID = 'platformHeroGradient';
const HONEYCOMB_ID = 'platformHeroHoneycomb';
const HONEYCOMB_TILE = buildHoneycombTile(platformHeroHoneycomb.cellRadius);

/** Degradado burdeos de las pantallas con marca Yoclick: luz en el centro, bordes oscuros y una colmena dorada muy sutil. */
export function PlatformHeroBackground(): React.JSX.Element {
  const { stops, centerX, centerY, radiusX, radiusY } = platformHeroGradient;

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" aria-hidden>
      <Defs>
        <RadialGradient id={GRADIENT_ID} cx={centerX} cy={centerY} rx={radiusX} ry={radiusY}>
          {stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </RadialGradient>
        <Pattern
          id={HONEYCOMB_ID}
          width={HONEYCOMB_TILE.width}
          height={HONEYCOMB_TILE.height}
          patternUnits="userSpaceOnUse"
        >
          <Path
            d={HONEYCOMB_TILE.pathData}
            fill="none"
            stroke={platformHeroHoneycomb.color}
            strokeOpacity={platformHeroHoneycomb.lineOpacity}
            strokeWidth={platformHeroHoneycomb.lineWidth}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
      <Rect width="100%" height="100%" fill={`url(#${HONEYCOMB_ID})`} />
    </Svg>
  );
}
