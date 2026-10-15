import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 52;
const NUMBER_PILL_SIZE = 24;
const NUMBER_PILL_RADIUS = 12;
const NUMBER_PILL_BORDER_WIDTH = 2;
/** El número asoma por la esquina del icono, sin tapar la mayor parte de él. */
const NUMBER_PILL_OFFSET = -6;
/** Sombra muy suave: separa la tarjeta del fondo sin dibujar un borde duro. */
const SOFT_SHADOW_OPACITY = 0.07;
const SOFT_SHADOW_RADIUS = 14;
const SOFT_SHADOW_OFFSET_Y = 4;
const SOFT_SHADOW_ELEVATION = 2;

export function createStepCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOpacity: SOFT_SHADOW_OPACITY,
    shadowRadius: SOFT_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: SOFT_SHADOW_OFFSET_Y },
    elevation: SOFT_SHADOW_ELEVATION,
  };
}

export function createStepIconTileStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brandSoft,
  };
}

/** Círculo de marca con el número: el color de marca solo como relleno, texto `onBrand`. */
export function createStepNumberPillStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: NUMBER_PILL_OFFSET,
    left: NUMBER_PILL_OFFSET,
    width: NUMBER_PILL_SIZE,
    height: NUMBER_PILL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: NUMBER_PILL_RADIUS,
    borderWidth: NUMBER_PILL_BORDER_WIDTH,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.brand,
  };
}

export function createStepTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}

export function createStepTitleRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.space[2] };
}
