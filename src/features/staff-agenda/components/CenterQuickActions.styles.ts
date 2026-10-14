import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const TILE_MIN_HEIGHT = 132;
const PRIMARY_MIN_HEIGHT = 92;
const ICON_BADGE_SIZE = 44;
const PRIMARY_ICON_BADGE_SIZE = 52;
/** Sombra muy suave: separa la tarjeta del fondo sin dibujar un borde duro. */
const SOFT_SHADOW_OPACITY = 0.07;
const SOFT_SHADOW_RADIUS = 14;
const SOFT_SHADOW_OFFSET_Y = 4;
const SOFT_SHADOW_ELEVATION = 2;
const PRIMARY_BADGE_VEIL_OPACITY = 0.16;

export function createQuickActionsStackStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createQuickActionsRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

/** Tarjeta blanca de esquinas muy redondeadas: icono arriba, nombre y apoyo abajo. */
export function createQuickActionTileStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    minHeight: TILE_MIN_HEIGHT,
    justifyContent: 'space-between',
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

/** La acción principal ocupa todo el ancho y va rellena con el color de marca. */
export function createPrimaryActionStyle(theme: Theme): ViewStyle {
  return {
    minHeight: PRIMARY_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.brand,
  };
}

export function createIconBadgeStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_BADGE_SIZE,
    height: ICON_BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brandSoft,
  };
}

export function createPrimaryIconBadgeStyle(theme: Theme): ViewStyle {
  return {
    width: PRIMARY_ICON_BADGE_SIZE,
    height: PRIMARY_ICON_BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
  };
}

/** Velo claro sobre la marca: el icono queda en una pastilla sin fijar un color nuevo. */
export function createPrimaryBadgeVeilStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: PRIMARY_BADGE_VEIL_OPACITY,
    backgroundColor: theme.colors.onBrand,
  };
}

export const PRIMARY_ACTION_TEXT_STYLE: ViewStyle = { flex: 1 };

export function createTileTextStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[1] };
}
