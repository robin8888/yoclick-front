import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createRowTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}
