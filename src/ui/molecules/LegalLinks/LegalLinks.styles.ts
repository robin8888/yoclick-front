import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createLegalLinksRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: theme.space[4],
  };
}

/** El texto es pequeño, pero el área pulsable llega al mínimo táctil. */
export const LEGAL_LINK_STYLE: ViewStyle = {
  minHeight: MIN_TOUCH_TARGET_SIZE,
  justifyContent: 'center',
};
