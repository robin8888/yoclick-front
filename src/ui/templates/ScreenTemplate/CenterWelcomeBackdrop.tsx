import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/shared/theme';

import { createWelcomePanelStyle } from './ScreenTemplate.styles';

// Dibujo del prototipo `welcome`: dos círculos de marca sobre el panel tintado.
const BACKDROP_WIDTH = 390;
const BACKDROP_HEIGHT = 460;
const BACKDROP_VIEW_BOX = '0 0 390 460';
const BACKDROP_CIRCLES = [
  { id: 'top-right', centerX: 340, centerY: 60, radius: 90, opacity: 0.18 },
  { id: 'bottom-left', centerX: 40, centerY: 330, radius: 60, opacity: 0.12 },
] as const;

/** Fondo de la bienvenida de un centro: panel con su color suave y dos círculos de su color de marca. */
export function CenterWelcomeBackdrop(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View pointerEvents="none" aria-hidden style={createWelcomePanelStyle(theme)}>
      <Svg width={BACKDROP_WIDTH} height={BACKDROP_HEIGHT} viewBox={BACKDROP_VIEW_BOX}>
        {BACKDROP_CIRCLES.map((circle) => (
          <Circle
            key={circle.id}
            cx={circle.centerX}
            cy={circle.centerY}
            r={circle.radius}
            fill={theme.colors.brand}
            opacity={circle.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}
