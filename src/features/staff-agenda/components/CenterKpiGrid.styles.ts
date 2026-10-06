import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createKpiGridStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] };
}
