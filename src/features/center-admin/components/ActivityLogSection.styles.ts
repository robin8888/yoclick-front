import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const ACTIVITY_LIST_STYLE: ViewStyle = { gap: 12 };

export function createActivityRowStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
