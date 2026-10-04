import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { platformHeroDarkGradient } from '@/shared/theme';

const GRADIENT_ID = 'platformHeroGradient';
const GLOW_ID = 'platformHeroGlow';

/** Degradado del modo oscuro de las pantallas con marca Yoclick; en claro no se dibuja nada. */
export function PlatformHeroBackground(): React.JSX.Element {
  const { stops, glowColor, glowOpacity, glowCenterX, glowCenterY, glowRadius } =
    platformHeroDarkGradient;

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" aria-hidden>
      <Defs>
        <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          {stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </LinearGradient>
        <RadialGradient
          id={GLOW_ID}
          cx={glowCenterX}
          cy={glowCenterY}
          rx={glowRadius}
          ry={glowRadius}
        >
          <Stop offset="0" stopColor={glowColor} stopOpacity={glowOpacity} />
          <Stop offset="1" stopColor={glowColor} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
      <Rect width="100%" height="100%" fill={`url(#${GLOW_ID})`} />
    </Svg>
  );
}
