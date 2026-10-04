import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { useReducedMotion, useTheme } from '@/shared/theme';

import {
  SKELETON_DIMMED_OPACITY,
  SKELETON_PULSE_HALF_CYCLE_MS,
  createSkeletonStyle,
} from './Skeleton.styles';
import type { SkeletonProps } from './Skeleton.types';

export function Skeleton(props: Readonly<SkeletonProps>): React.JSX.Element {
  const theme = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const [pulseOpacity] = useState(() => new Animated.Value(1));

  // Sincroniza con el sistema de animación nativo; con «reducir movimiento» el bloque queda quieto.
  useEffect(() => {
    if (isReducedMotionEnabled) return undefined;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: SKELETON_DIMMED_OPACITY,
          duration: SKELETON_PULSE_HALF_CYCLE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: SKELETON_PULSE_HALF_CYCLE_MS,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulseOpacity.setValue(1);
    };
  }, [isReducedMotionEnabled, pulseOpacity]);

  // Decorativo: quien lo usa (ScreenSkeleton) anuncia el estado de carga una sola vez.
  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={[createSkeletonStyle({ ...props, theme }), { opacity: pulseOpacity }]}
    />
  );
}
