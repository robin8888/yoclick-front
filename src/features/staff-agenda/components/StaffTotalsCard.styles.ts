import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createTotalsCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brandSoft,
  };
}
