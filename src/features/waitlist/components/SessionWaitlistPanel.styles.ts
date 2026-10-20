import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createPanelStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createPersonRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
  };
}

export const PERSON_TEXT_STYLE: ViewStyle = { flex: 1 };
