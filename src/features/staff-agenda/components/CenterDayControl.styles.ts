import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createDayControlStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  };
}

export function createDayControlRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[1] };
}
