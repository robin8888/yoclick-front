import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const ICON_CIRCLE_SIZE = 48;
const TILE_MIN_HEIGHT = 104;

export function createQuickAccessSectionStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createQuickAccessGridStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

/** Tarjeta centrada del prototipo `home`: icono en un círculo suave de marca y el nombre debajo. */
export function createQuickAccessTileStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    minHeight: Math.max(TILE_MIN_HEIGHT, MIN_TOUCH_TARGET_SIZE),
    alignItems: 'center',
    // Desde arriba, no centrado: un nombre de dos líneas no baja el icono respecto a las demás tarjetas.
    justifyContent: 'flex-start',
    gap: theme.space[3],
    paddingVertical: theme.space[4],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
  };
}

export function createQuickAccessIconStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandSoft,
  };
}
