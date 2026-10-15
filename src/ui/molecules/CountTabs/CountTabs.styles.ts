import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const SELECTED_BORDER_WIDTH = 2;
const DEFAULT_BORDER_WIDTH = 1;

export function createCountTabsStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[2] };
}

/** Una pestaña con su número arriba y su nombre debajo; la elegida lleva el color del centro. */
export function createCountTabStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.lg,
    borderWidth: isSelected ? SELECTED_BORDER_WIDTH : DEFAULT_BORDER_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brand : theme.colors.surface,
  };
}
