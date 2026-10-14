import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const SOFT_SHADOW_OPACITY = 0.07;
const SOFT_SHADOW_RADIUS = 14;
const SOFT_SHADOW_OFFSET_Y = 4;
const SOFT_SHADOW_ELEVATION = 2;
const DATE_BLOCK_WIDTH = 52;
const DATE_BLOCK_HEIGHT = 60;
const STATUS_DOT_SIZE = 8;
const STAT_DIVIDER_WIDTH = 1;

/** Sombra muy suave que separa la tarjeta del fondo sin dibujar un borde duro. */
function createSoftShadow(theme: Theme): ViewStyle {
  return {
    shadowColor: theme.colors.ink,
    shadowOpacity: SOFT_SHADOW_OPACITY,
    shadowRadius: SOFT_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: SOFT_SHADOW_OFFSET_Y },
    elevation: SOFT_SHADOW_ELEVATION,
  };
}

/** El selector de mes como una píldora: flechas a los lados y el mes en el centro. */
export function createMonthSwitcherStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[3],
    padding: theme.space[1],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** La tarjeta grande del mes: lo trabajado en grande y, debajo, días y fichajes editados. */
export function createHeroCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    ...createSoftShadow(theme),
  };
}

export function createHeroStatsStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.space[4],
    borderTopWidth: STAT_DIVIDER_WIDTH,
    borderTopColor: theme.colors.line,
  };
}

export function createHeroStatStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}

export function createDayCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    ...createSoftShadow(theme),
  };
}

/** El bloque de fecha de cada día: la semana abreviada arriba y el número grande. */
export function createDateBlockStyle(theme: Theme): ViewStyle {
  return {
    width: DATE_BLOCK_WIDTH,
    height: DATE_BLOCK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brandSoft,
  };
}

export function createDayBodyStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}

export function createDayHeaderStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  };
}

export function createEntryRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
    minHeight: theme.space[10],
  };
}

export function createEntryMainStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}

export function createEntryBadgesStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[1] };
}

/** El punto de estado junto a la hora: verde en curso, de marca si está cerrado. Siempre con palabra aparte. */
export function createStatusDotStyle(theme: Theme, isOpen: boolean): ViewStyle {
  return {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE,
    backgroundColor: isOpen ? theme.colors.success : theme.colors.brand,
  };
}

export function createRangeRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] };
}

export function createEditorWheelsStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

export function createEditorStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[4] };
}
