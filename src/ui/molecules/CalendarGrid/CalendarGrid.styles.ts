import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const SELECTED_RING_WIDTH = 2;

export function createCalendarStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const CALENDAR_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const CALENDAR_WEEK_STYLE: ViewStyle = { flexDirection: 'row' };

export function createDayCellStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    // El día elegido lleva relleno de marca y además un aro: no depende solo del color.
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
    borderWidth: isSelected ? SELECTED_RING_WIDTH : 0,
    borderColor: theme.colors.ink,
  };
}

export const WEEKDAY_CELL_STYLE: ViewStyle = { flex: 1, alignItems: 'center' };
