import type { ViewStyle } from 'react-native';

import type { RoomPaletteColor, Theme } from '@/shared/theme';

import type { SeatState } from '../model/seat-state';

const DOT_SIZE = { sm: 8, md: 24 } as const;
const HALF = 2;
export type RoomDotSize = keyof typeof DOT_SIZE;
const HOUR_LABEL_WIDTH = 52;
const EMPTY_HOUR_LINE_HEIGHT = 1;
const WEEK_DAY_MIN_WIDTH = 40;
const DOT_ROW_HEIGHT = 10;

/** El círculo de color de una sala; en `md` lleva la letra dentro. */
export function createRoomDotStyle(color: RoomPaletteColor, size: RoomDotSize): ViewStyle {
  const diameter = DOT_SIZE[size];
  return {
    width: diameter,
    height: diameter,
    borderRadius: diameter / HALF,
    backgroundColor: color.background,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export const WRAP_ROW_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };

export const HOUR_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  alignItems: 'flex-start',
};

export function createHourLabelStyle(theme: Theme): ViewStyle {
  return { width: HOUR_LABEL_WIDTH, paddingTop: theme.space[1] };
}

export const HOUR_CHIPS_STYLE: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
};

/** Una hora sin nada: una línea fina, para leer el día de un vistazo. */
export function createEmptyHourLineStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    height: EMPTY_HOUR_LINE_HEIGHT,
    marginTop: theme.space[3],
    backgroundColor: theme.colors.line,
  };
}

/** Ficha de una clase (sala + servicio + plazas); la elegida en la leyenda va con fondo de marca. */
export function createChipStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brandSoft : theme.colors.surface,
  };
}

/** Ficha de un bloqueo: borde discontinuo y fondo apagado, para que no parezca una clase. */
export function createBlockChipStyle(theme: Theme): ViewStyle {
  return {
    ...createChipStyle(theme, false),
    borderStyle: 'dashed',
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface2,
  };
}

export const CHIP_TEXT_STYLE: ViewStyle = { flexShrink: 1 };

export const WEEK_STRIP_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};

export function createWeekDayStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    minWidth: WEEK_DAY_MIN_WIDTH,
    alignItems: 'center',
    gap: theme.space[1],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[1],
    borderRadius: theme.radius.md,
    backgroundColor: isSelected ? theme.colors.brandSoft : 'transparent',
  };
}

export const WEEK_DOTS_STYLE: ViewStyle = {
  flexDirection: 'row',
  gap: 3,
  height: DOT_ROW_HEIGHT,
  alignItems: 'center',
};

const SEAT_BORDER_WIDTH = 2;

/** Ficha de una clase: solo el borde (2 px) dice el estado, rojo si quedan plazas y verde si está completa. */
export function createSessionChipStyle(theme: Theme, seatState: SeatState): ViewStyle {
  const borderColors: Record<SeatState, string> = {
    open: theme.colors.danger,
    full: theme.colors.success,
    private: theme.colors.line,
    cancelled: theme.colors.lineStrong,
  };
  return {
    ...createChipStyle(theme, false),
    borderWidth: SEAT_BORDER_WIDTH,
    borderColor: borderColors[seatState],
    ...(seatState === 'cancelled' ? { borderStyle: 'dashed' as const } : {}),
  };
}
