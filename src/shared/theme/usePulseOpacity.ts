import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { motionTokens } from './motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Opacidad que late despacio entre `pulseMinOpacity` y 1 mientras `isActive`, para llamar la atención sobre
 * algo que el usuario debe completar. Con «reducir movimiento» no late: se queda fija en 1 (visible, sin
 * movimiento). Sincroniza con un sistema externo (la animación nativa), por eso usa efecto.
 */
export function usePulseOpacity(isActive: boolean): Animated.Value {
  const isReducedMotionEnabled = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));
  const shouldPulse = isActive && !isReducedMotionEnabled;

  useEffect(() => {
    if (!shouldPulse) {
      opacity.setValue(1);
      return undefined;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: motionTokens.pulseMinOpacity,
          duration: motionTokens.durationPulseMs,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: motionTokens.durationPulseMs,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [shouldPulse, opacity]);

  return opacity;
}
