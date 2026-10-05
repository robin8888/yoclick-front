import type { ViewStyle } from 'react-native';

import { type Theme } from '@/shared/theme';

const DAY_PILL_WIDTH = 56;
const DAY_PILL_HEIGHT = 72;
const DAY_PILL_BORDER_WIDTH = 1.5;

export function createDayPillStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    width: DAY_PILL_WIDTH,
    height: DAY_PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    borderRadius: theme.radius.lg,
    borderWidth: DAY_PILL_BORDER_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brand : theme.colors.surface,
  };
}
