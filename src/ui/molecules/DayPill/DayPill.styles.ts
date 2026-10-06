import type { ViewStyle } from 'react-native';

import { type Theme } from '@/shared/theme';

const DAY_PILL_WIDTH = 56;
const DAY_PILL_HEIGHT = 72;
const DAY_PILL_BORDER_WIDTH = 1.5;

export function createDayPillStyle(
  theme: Theme,
  isSelected: boolean,
  selectedTone: 'brand' | 'ink' = 'brand',
): ViewStyle {
  const selectedFill = selectedTone === 'ink' ? theme.colors.ink : theme.colors.brand;
  return {
    width: DAY_PILL_WIDTH,
    height: DAY_PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    borderRadius: theme.radius.lg,
    borderWidth: DAY_PILL_BORDER_WIDTH,
    borderColor: isSelected ? selectedFill : theme.colors.line,
    backgroundColor: isSelected ? selectedFill : theme.colors.surface,
  };
}
