import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const SLOT_BORDER_WIDTH = 1.5;

export function createSlotButtonStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    flexDirection: 'row',
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.md,
    borderWidth: SLOT_BORDER_WIDTH,
    // Relleno de marca solo cuando está elegido (`brand` es un relleno, nunca un texto).
    borderColor: isSelected ? theme.colors.brand : theme.colors.lineStrong,
    backgroundColor: isSelected ? theme.colors.brand : theme.colors.surface,
  };
}
