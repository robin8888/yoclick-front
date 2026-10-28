import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const PULSING_BORDER_WIDTH = 2;

export function createPulsingBorderStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: PULSING_BORDER_WIDTH,
    borderRadius: theme.radius.xl,
    borderColor: theme.colors.brand,
  };
}
