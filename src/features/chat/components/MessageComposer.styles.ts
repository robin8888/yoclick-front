import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createComposerStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.space[2],
  };
}

export const COMPOSER_INPUT_STYLE: ViewStyle = { flex: 1 };
