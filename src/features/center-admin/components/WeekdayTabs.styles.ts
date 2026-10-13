import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const DOT_SIZE = 6;
const HALF = 2;

export function createWeekdayTabsStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    gap: theme.space[1],
    padding: theme.space[1],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createWeekdayTabStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    borderRadius: theme.radius.md,
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
  };
}

/** El punto bajo el día: hay clases fijas ese día. */
export function createWeekdayDotStyle(color: string): ViewStyle {
  return {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / HALF,
    backgroundColor: color,
  };
}
