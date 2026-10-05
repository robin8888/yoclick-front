import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const SHEET_ANCHOR_STYLE: ViewStyle = { flex: 1, justifyContent: 'flex-end' };

export function createBackdropStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.scrim,
  };
}

export function createSheetStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[4],
    padding: theme.space[5],
    paddingBottom: theme.space[8],
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  };
}
