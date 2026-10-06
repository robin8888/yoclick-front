import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ANY_STAFF_AVATAR_SIZE = 44;
const HALF = 0.5;

export function createAnyStaffAvatarStyle(theme: Theme): ViewStyle {
  return {
    width: ANY_STAFF_AVATAR_SIZE,
    height: ANY_STAFF_AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ANY_STAFF_AVATAR_SIZE * HALF,
    backgroundColor: theme.colors.surface2,
  };
}
