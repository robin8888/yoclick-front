import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createFormFieldStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[1] };
}
