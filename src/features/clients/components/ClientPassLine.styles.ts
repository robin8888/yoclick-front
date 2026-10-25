import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createClientPassLineStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.space[2],
    marginTop: theme.space[1],
  };
}
