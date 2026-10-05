import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createTabBarStyle(theme: Theme, bottomInset: number): ViewStyle {
  return {
    flexDirection: 'row',
    paddingTop: theme.space[2],
    paddingBottom: Math.max(bottomInset, theme.space[2]),
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createTabItemStyle(theme: Theme, isActive: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    borderRadius: theme.radius.md,
    backgroundColor: isActive ? theme.colors.brandSoft : 'transparent',
  };
}
