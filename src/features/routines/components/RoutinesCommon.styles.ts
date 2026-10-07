import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createChipStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.brandInk : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brandSoft : theme.colors.surface,
  };
}

export function createLibraryRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingVertical: theme.space[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  };
}

export const SECTION_STYLE: ViewStyle = { gap: 12 };
export const ROW_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 12 };
export const GROW_STYLE: ViewStyle = { flex: 1 };
export const CHIPS_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };
