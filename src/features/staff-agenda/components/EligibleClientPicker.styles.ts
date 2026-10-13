import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createEligibleRowStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.brandInk : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brandSoft : theme.colors.surface,
  };
}

export const ELIGIBLE_ROW_TEXT_STYLE: ViewStyle = { flex: 1 };
