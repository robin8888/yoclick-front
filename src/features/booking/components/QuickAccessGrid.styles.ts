import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 44;

export function createQuickAccessSectionStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createQuickAccessGridStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

export function createQuickAccessTileStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createQuickAccessIconStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brandSoft,
  };
}
