import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const RIPPLE_BORDER_WIDTH = 2;

/** Una onda con el color del centro, del tamaño del botón, justo detrás de él. */
export function createRippleStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius.pill,
    borderWidth: RIPPLE_BORDER_WIDTH,
    borderColor: theme.colors.brand,
    opacity: 0,
  };
}
