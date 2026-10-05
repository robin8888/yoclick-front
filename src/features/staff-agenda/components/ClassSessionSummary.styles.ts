import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createSummaryStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const SUMMARY_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
};
