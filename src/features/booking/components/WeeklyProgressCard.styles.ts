import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createWeeklyCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const WEEKLY_TEXT_STYLE: ViewStyle = { flex: 1 };
