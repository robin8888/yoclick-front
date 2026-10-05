import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE } from '@/shared/theme';

export type AuthLinkAlignment = 'start' | 'center' | 'end';

const SELF_ALIGNMENT: Record<AuthLinkAlignment, ViewStyle['alignSelf']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

export function createAuthLinkStyle(alignment: AuthLinkAlignment): ViewStyle {
  return {
    alignSelf: SELF_ALIGNMENT[alignment],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    justifyContent: 'center',
  };
}
