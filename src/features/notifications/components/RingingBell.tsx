import { Animated, View } from 'react-native';

import {
  motionTokens,
  useBellRingAnimation,
  useTheme,
  type BellRingAnimation,
} from '@/shared/theme';

import { createRippleStyle } from './RingingBell.styles';

interface RingingBellProps {
  /** Hay avisos sin leer: la campana tintinea y lanza ondas. */
  isRinging: boolean;
  children: React.ReactNode;
}

/** El instante en que una onda aparece: casi 0, para que nazca de golpe y se desvanezca después. */
const RIPPLE_APPEAR_AT = 0.01;

function Ripple({ progress }: Readonly<{ progress: Animated.Value }>): React.JSX.Element {
  const theme = useTheme();
  const opacity = progress.interpolate({
    inputRange: [0, RIPPLE_APPEAR_AT, 1],
    outputRange: [0, motionTokens.rippleMaxOpacity, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, motionTokens.rippleEndScale],
  });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[createRippleStyle(theme), { opacity, transform: [{ scale }] }]}
    />
  );
}

function createSwingTransform(animation: BellRingAnimation): Animated.WithAnimatedObject<{
  transform: ({ translateY: number } | { rotate: Animated.AnimatedInterpolation<string> })[];
}> {
  // Gira desde un punto por encima del centro, como una campana que cuelga, y no sobre su eje.
  const pivot = motionTokens.ringPivotOffset;
  return {
    transform: [{ translateY: -pivot }, { rotate: animation.rotation }, { translateY: pivot }],
  };
}

/**
 * Envuelve un botón con el tintineo de una campana: gira amortiguándose desde arriba, da un pequeño salto y
 * lanza dos ondas con el color del centro. Las ondas no reciben toques ni se anuncian.
 */
export function RingingBell({
  isRinging,
  children,
}: Readonly<RingingBellProps>): React.JSX.Element {
  const animation = useBellRingAnimation(isRinging);

  return (
    <View>
      {animation.rippleProgress.map((progress, index) => (
        <Ripple key={index} progress={progress} />
      ))}
      <Animated.View style={{ transform: [{ scale: animation.popScale }] }}>
        <Animated.View style={createSwingTransform(animation)}>{children}</Animated.View>
      </Animated.View>
    </View>
  );
}
