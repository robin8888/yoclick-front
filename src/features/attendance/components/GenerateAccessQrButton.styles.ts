import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 48;

export function createGenerateQrCardStyle(theme: Theme, isAvailable: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    // Disponible: relleno con el color del centro. No disponible: tarjeta neutra con borde.
    borderColor: isAvailable ? theme.colors.brand : theme.colors.line,
    backgroundColor: isAvailable ? theme.colors.brand : theme.colors.surface,
  };
}

export function createGenerateQrIconTileStyle(theme: Theme, isAvailable: boolean): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: isAvailable ? theme.colors.surface : theme.colors.surface2,
  };
}

export const GENERATE_QR_TEXT_STYLE: ViewStyle = { flex: 1 };
