import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const SQUARE_HEIGHT = 168;
export const HUE_BAR_HEIGHT = 32;
const THUMB_DIAMETER = 28;
export const THUMB_SIZE = THUMB_DIAMETER;
export const THUMB_RADIUS = 14;
const THUMB_BORDER_WIDTH = 3;

export const PICKER_STYLE: ViewStyle = { gap: 12 };

export function createSurfaceStyle(theme: Theme, height: number): ViewStyle {
  return {
    height,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    overflow: 'hidden',
  };
}

/** El tirador: un círculo con borde blanco y sombra fina para verse sobre cualquier color. */
export function createThumbStyle(theme: Theme, fillColor: string): ViewStyle {
  return {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: theme.radius.pill,
    borderWidth: THUMB_BORDER_WIDTH,
    borderColor: theme.colors.surface,
    backgroundColor: fillColor,
    shadowColor: theme.colors.ink,
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  };
}
