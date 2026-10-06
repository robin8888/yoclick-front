import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export function createRoomChipStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const ROOM_CHIPS_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 };
