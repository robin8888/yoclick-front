import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const SHEET_ANCHOR_STYLE: ViewStyle = { flex: 1, justifyContent: 'flex-end' };

/** La hoja no pasa de esta parte de la pantalla: lo que sobra se desplaza dentro. */
const MAX_SHEET_HEIGHT = '85%';

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
    maxHeight: MAX_SHEET_HEIGHT,
    padding: theme.space[5],
    paddingBottom: theme.space[8],
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  };
}

export function createSheetContentStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[4] };
}
