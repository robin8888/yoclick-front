import type { ViewStyle } from 'react-native';

import { platformAccentColors, type Theme } from '@/shared/theme';

const BADGE_SIZE = 88;

export function createIconBadgeStyle(theme: Theme): ViewStyle {
  return {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: platformAccentColors.iconTile,
    borderWidth: 1,
    borderColor: theme.colors.line,
  };
}
