import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createScreenStyle(theme: Theme): ViewStyle {
  return { flex: 1, backgroundColor: theme.colors.bg };
}

export function createContentStyle(theme: Theme): ViewStyle {
  return { flexGrow: 1, gap: theme.space[5], padding: theme.space[5] };
}

export function createHeaderStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[2] };
}

export function createFooterStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[5],
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.bg,
  };
}

export const KEYBOARD_AVOIDING_STYLE: ViewStyle = { flex: 1 };
