import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createJoinCodeCardStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.brandSoft,
  };
}
