import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const TILE_HEIGHT = 112;
/** El icono de fondo se dibuja grande y se asoma por la esquina: se ve la mitad. */
const WATERMARK_SCALE = 3.4;
const WATERMARK_OFFSET_END = 14;
const WATERMARK_OFFSET_BOTTOM = 10;
const WATERMARK_OPACITY = 0.16;

/** Las filas llenan el ancho de la pantalla; entre ellas y entre botones, el mismo hueco. */
export function createQuickActionsStackStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createQuickActionsRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

/**
 * Botón grande de acceso: el nombre abajo a la izquierda y su icono grande de fondo asomando por
 * la esquina, recortado por el botón. El principal va relleno de marca.
 */
export function createQuickActionStyle(theme: Theme, isPrimary: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: TILE_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: isPrimary ? theme.colors.brand : theme.colors.line,
    backgroundColor: isPrimary ? theme.colors.brand : theme.colors.surface,
  };
}

/** El icono grande de fondo, pegado a la esquina inferior derecha y recortado por el botón. */
export const QUICK_ACTION_WATERMARK_STYLE: ViewStyle = {
  position: 'absolute',
  end: WATERMARK_OFFSET_END,
  bottom: WATERMARK_OFFSET_BOTTOM,
  opacity: WATERMARK_OPACITY,
  transform: [{ scale: WATERMARK_SCALE }],
};
