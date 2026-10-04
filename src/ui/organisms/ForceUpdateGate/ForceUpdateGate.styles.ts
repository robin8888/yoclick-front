import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createGateStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.space[6],
    backgroundColor: theme.colors.bg,
  };
}

export function createGateContentStyle(theme: Theme): ViewStyle {
  return { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.space[4] };
}
