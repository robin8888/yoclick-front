import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export const WHEEL_ITEM_HEIGHT = MIN_TOUCH_TARGET_SIZE;
/** Filas visibles por defecto, como la rueda del iPhone: la de en medio es la elegida. */
export const DEFAULT_WHEEL_VISIBLE_ITEMS = 5;
const WHEEL_MIN_WIDTH = 72;
const HALF = 2;

/** Hueco arriba y abajo para que la primera y la última opción puedan llegar al centro. */
function getWheelPadding(visibleItems: number): number {
  return (WHEEL_ITEM_HEIGHT * (visibleItems - 1)) / HALF;
}

export function createWheelStyle(visibleItems: number): ViewStyle {
  return {
    height: WHEEL_ITEM_HEIGHT * visibleItems,
    minWidth: WHEEL_MIN_WIDTH,
    flex: 1,
    justifyContent: 'center',
  };
}

/** La franja gris del centro que marca lo elegido, detrás de las opciones. */
export function createWheelBandStyle(theme: Theme, visibleItems: number): ViewStyle {
  return {
    position: 'absolute',
    start: 0,
    end: 0,
    top: getWheelPadding(visibleItems),
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
  };
}

export function createWheelContentStyle(visibleItems: number): ViewStyle {
  return { paddingVertical: getWheelPadding(visibleItems) };
}

export const WHEEL_ITEM_STYLE: ViewStyle = {
  height: WHEEL_ITEM_HEIGHT,
  alignItems: 'center',
  justifyContent: 'center',
};
