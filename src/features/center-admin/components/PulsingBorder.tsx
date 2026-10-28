import { Animated } from 'react-native';

import { usePulseOpacity, useTheme } from '@/shared/theme';

import { createPulsingBorderStyle } from './PulsingBorder.styles';

/**
 * Borde con el color del centro que late por encima de una tarjeta, para que se vea a primera vista que
 * queda algo por completar. No recibe toques ni se anuncia: la tarjeta ya explica lo que falta.
 */
export function PulsingBorder({ isActive }: Readonly<{ isActive: boolean }>): React.JSX.Element {
  const theme = useTheme();
  const opacity = usePulseOpacity(isActive);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[createPulsingBorderStyle(theme), { opacity }]}
    />
  );
}
