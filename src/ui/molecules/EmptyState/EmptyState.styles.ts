import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 72;

// El botón se alinea al inicio por defecto: una fila centrada lo deja en el medio.
export const ACTION_ROW_STYLE: ViewStyle = { flexDirection: 'row', justifyContent: 'center' };

export function createEmptyStateStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.space[5],
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createIconTileStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
