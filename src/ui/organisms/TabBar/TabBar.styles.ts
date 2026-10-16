import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

/** Cuánto desenfoca el cristal de la barra lo que pasa por detrás. */
export const TAB_BAR_BLUR_INTENSITY = 40;

/** Aire a cada lado con la barra encogida (a todo su ancho es `space[3]`). */
export const COMPACT_BAR_SIDE_SPACE = 48;

const SIDES_PER_BAR = 2;
const SHADOW_OPACITY = 0.2;
const SHADOW_RADIUS = 16;
const SHADOW_OFFSET_Y = 6;
const SHADOW_ELEVATION = 10;

/** El hueco transparente que deja la píldora flotando: aire a los lados y sobre el borde inferior. */
export function createTabBarMarginStyle(theme: Theme, bottomInset: number): ViewStyle {
  return {
    paddingHorizontal: theme.space[3],
    paddingBottom: Math.max(bottomInset, theme.space[2]),
  };
}

/** Píldora flotante de cristal: transparente, con borde fino y sombra, como la barra de Lughly. */
export function createTabBarStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignSelf: 'center',
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[1],
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    shadowColor: theme.colors.ink,
    shadowOpacity: SHADOW_OPACITY,
    shadowRadius: SHADOW_RADIUS,
    shadowOffset: { width: 0, height: SHADOW_OFFSET_Y },
    elevation: SHADOW_ELEVATION,
  };
}

export function createTabItemStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    paddingVertical: theme.space[1],
  };
}

/** Ancho de la píldora a todo su ancho y encogida, con el aire que se deja a cada lado. */
export function getTabBarWidths(
  theme: Theme,
  windowWidth: number,
): { fullWidth: number; compactWidth: number } {
  return {
    fullWidth: windowWidth - theme.space[3] * SIDES_PER_BAR,
    compactWidth: windowWidth - COMPACT_BAR_SIDE_SPACE * SIDES_PER_BAR,
  };
}
