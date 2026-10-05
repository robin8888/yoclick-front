import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, platformCardColors, type Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 44;
const SELECTED_BORDER_WIDTH = 2.5;
const IDLE_BORDER_WIDTH = 2.5;

export function createAccountRoleCardStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: isSelected ? SELECTED_BORDER_WIDTH : IDLE_BORDER_WIDTH,
    borderColor: isSelected ? platformCardColors.selectedBorder : 'transparent',
    backgroundColor: platformCardColors.surface,
  };
}

export function createRoleIconTileStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: platformCardColors.iconTile,
  };
}

export const ROLE_TEXT_STYLE: ViewStyle = { flex: 1 };
