import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createPlanCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const PLAN_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const PLAN_LINES_STYLE: ViewStyle = { gap: 2 };
