import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createTwoFactorCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const TWO_FACTOR_TEXT_STYLE: ViewStyle = { flex: 1, gap: 2 };
