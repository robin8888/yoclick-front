import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const DAY_CIRCLE_SIZE = 40;
const HALF = 2;

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

/** Como el calendario del iPhone: el mes a la izquierda y las flechas juntas a la derecha. */
export const CALENDAR_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const CALENDAR_ARROWS_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center' };

export const CALENDAR_WEEK_STYLE: ViewStyle = { flexDirection: 'row' };

/** La celda de un día: ocupa 1/7 de la fila y centra el círculo. */
export function createDayCellStyle(): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/** El círculo del día: relleno de marca si es el elegido (y el número en negrita, no solo color). */
export function createDayCircleStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    width: DAY_CIRCLE_SIZE,
    height: DAY_CIRCLE_SIZE,
    borderRadius: DAY_CIRCLE_SIZE / HALF,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
  };
}

export const WEEKDAY_CELL_STYLE: ViewStyle = { flex: 1, alignItems: 'center' };
