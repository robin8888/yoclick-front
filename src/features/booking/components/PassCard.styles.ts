import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 44;

export function createPassCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createPassIconStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brandSoft,
  };
}

export const PASS_TEXT_STYLE: ViewStyle = { flex: 1 };
