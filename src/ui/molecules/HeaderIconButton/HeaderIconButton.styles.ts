import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const BUTTON_SIZE = 48;

export function createHeaderIconButtonStyle(theme: Theme): ViewStyle {
  return {
    width: Math.max(BUTTON_SIZE, MIN_TOUCH_TARGET_SIZE),
    height: Math.max(BUTTON_SIZE, MIN_TOUCH_TARGET_SIZE),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
