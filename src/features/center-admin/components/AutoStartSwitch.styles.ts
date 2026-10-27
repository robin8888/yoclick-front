import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createAutoStartCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createAutoStartTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}
