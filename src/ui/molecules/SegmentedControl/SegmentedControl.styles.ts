import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const CONTROL_PADDING = 4;

export function createSegmentedControlStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    padding: CONTROL_PADDING,
    gap: CONTROL_PADDING,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
  };
}

export function createSegmentStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    // Relleno de marca solo en la opción elegida (`brand` nunca es un texto).
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
  };
}
