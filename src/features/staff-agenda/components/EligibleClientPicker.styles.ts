import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const CHECK_SIZE = 28;
const SELECTED_BORDER_WIDTH = 2;

export function createEligibleRowStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: isSelected ? SELECTED_BORDER_WIDTH : 1,
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brandSoft : theme.colors.surface,
  };
}

export const ELIGIBLE_ROW_TEXT_STYLE: ViewStyle = { flex: 1, gap: 4, alignItems: 'flex-start' };

export const ELIGIBLE_LIST_STYLE: ViewStyle = { gap: 8 };

/** El círculo de la derecha: vacío para elegir y relleno de marca con check si está elegida. */
export function createEligibleCheckStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: SELECTED_BORDER_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.lineStrong,
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
  };
}
