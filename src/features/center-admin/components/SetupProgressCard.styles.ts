import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createProgressCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createProgressHeaderStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] };
}

export function createProgressTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}
