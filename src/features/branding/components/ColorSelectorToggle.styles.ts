import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export const COLOR_WHEEL_SIZE = 40;
const OPEN_BORDER_WIDTH = 2;
const CLOSED_BORDER_WIDTH = 1;

export function createColorSelectorStyle(theme: Theme, isOpen: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: isOpen ? OPEN_BORDER_WIDTH : CLOSED_BORDER_WIDTH,
    // Abierto, el borde con la tinta del tema lo marca sin depender solo del color.
    borderColor: isOpen ? theme.colors.ink : theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const COLOR_SELECTOR_TEXT_STYLE: ViewStyle = { flex: 1 };
