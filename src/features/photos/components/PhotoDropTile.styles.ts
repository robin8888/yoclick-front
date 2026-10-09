import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const TILE_MIN_HEIGHT = 120;

export function createPhotoTileStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    minHeight: TILE_MIN_HEIGHT,
    padding: theme.space[4],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  };
}
