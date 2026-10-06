import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const TOTALS_ROW_STYLE: ViewStyle = { flexDirection: 'row', gap: 10 };

export function createTotalCardStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    gap: theme.space[1],
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
