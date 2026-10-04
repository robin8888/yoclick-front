import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 52;

export function createEmptyStateStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[6],
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
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
