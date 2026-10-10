import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createProfileHeaderStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[4] };
}

export const PROFILE_HEADER_TEXT_STYLE: ViewStyle = { flex: 1, gap: 4, alignItems: 'flex-start' };

export function createProfileListStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createThemeRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: 64,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const THEME_ROW_TEXT_STYLE: ViewStyle = { flex: 1 };
