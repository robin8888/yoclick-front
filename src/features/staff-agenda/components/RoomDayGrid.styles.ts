import type { ViewStyle } from 'react-native';

import { FINISHED_PALETTE, type RoomPaletteColor, type Theme } from '@/shared/theme';

const DOT_SIZE = { sm: 8, md: 24 } as const;
const HALF = 2;
export type RoomDotSize = keyof typeof DOT_SIZE;
const HOUR_LABEL_WIDTH = 52;
const EMPTY_HOUR_HEIGHT = 24;
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

/** Las tarjetas de una hora, junto a la línea vertical que une todas las horas del día. */
export function createHourCardsStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[2],
    paddingStart: theme.space[3],
    paddingBottom: theme.space[3],
    borderStartWidth: 1,
    borderStartColor: theme.colors.line,
  };
}

/** Una hora sin nada: solo la línea vertical, con la altura justa para leer el día de un vistazo. */
export function createEmptyHourStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    height: EMPTY_HOUR_HEIGHT,
    borderStartWidth: 1,
    borderStartColor: theme.colors.line,
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

export function createWeekStripStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.space[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

interface WeekDayStyleInput {
  isSelected: boolean;
  /** El día ya pasó: fondo gris; si además es el elegido, un borde de marca lo distingue. */
  isPast: boolean;
}

export function createWeekDayStyle(
  theme: Theme,
  { isSelected, isPast }: WeekDayStyleInput,
): ViewStyle {
  const fill = isSelected ? theme.colors.brand : 'transparent';
  return {
    minWidth: WEEK_DAY_MIN_WIDTH,
    alignItems: 'center',
    gap: theme.space[1],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[1],
    borderRadius: theme.radius.md,
    borderWidth: WEEK_DAY_BORDER_WIDTH,
    borderColor: isPast && isSelected ? theme.colors.brand : 'transparent',
    backgroundColor: isPast ? FINISHED_PALETTE.background : fill,
  };
}

export const WEEK_DOTS_STYLE: ViewStyle = {
  flexDirection: 'row',
  gap: 3,
  height: DOT_ROW_HEIGHT,
  alignItems: 'center',
};

const WEEK_DAY_BORDER_WIDTH = 2;
const SESSION_CARD_ACCENT_WIDTH = 4;
const SESSION_CARD_MIN_WIDTH = 168;

/** Tarjeta de una clase: borde fino y una franja del color de su sala a la izquierda. */
export function createSessionCardStyle(theme: Theme, accentColor: string): ViewStyle {
  return {
    flexGrow: 1,
    flexBasis: SESSION_CARD_MIN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderLeftWidth: SESSION_CARD_ACCENT_WIDTH,
    borderColor: theme.colors.line,
    borderLeftColor: accentColor,
    backgroundColor: theme.colors.surface,
  };
}
