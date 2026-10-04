import type { PressableStateCallbackType, ViewStyle } from 'react-native';

import { useReducedMotion } from './useReducedMotion';

interface PressableStyleRequest {
  baseStyle: ViewStyle;
  /** Escala al pulsar: `motionTokens.pressScaleButton` o `pressScaleIconButton`. */
  pressedScale: number;
  isEnabled: boolean;
}

/**
 * Estilo de un `Pressable` con el rebote de pulsación del sistema de diseño. El rebote es
 * movimiento, así que con «reducir movimiento» no se aplica.
 */
export function usePressableStyle({
  baseStyle,
  pressedScale,
  isEnabled,
}: PressableStyleRequest): (state: PressableStateCallbackType) => ViewStyle {
  const isReducedMotionEnabled = useReducedMotion();

  return (state) => {
    const shouldScale = state.pressed && isEnabled && !isReducedMotionEnabled;
    return shouldScale ? { ...baseStyle, transform: [{ scale: pressedScale }] } : baseStyle;
  };
}
