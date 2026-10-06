import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const BUSY_LOGO_HEIGHT = 88;

export function createBusyOverlayStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.scrim,
  };
}
