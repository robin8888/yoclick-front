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

export function createTabItemStyle(): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/** Prototipo: la pestaña activa es una píldora del color suave del centro tras icono y texto. */
export function createTabPillStyle(theme: Theme, isActive: boolean): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[1],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[1],
    maxWidth: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: isActive ? theme.colors.brandSoft : 'transparent',
  };
}
