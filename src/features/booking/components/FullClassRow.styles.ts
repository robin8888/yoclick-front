import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createFullClassRowStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
