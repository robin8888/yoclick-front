import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createWelcomeIdentityStyle(theme: Theme): ViewStyle {
  return { alignItems: 'center', gap: theme.space[5] };
}
