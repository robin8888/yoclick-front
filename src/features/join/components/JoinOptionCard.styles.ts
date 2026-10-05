import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, platformCardColors, type Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 60;
const CARD_SHADOW_OPACITY = 0.3;
const CARD_SHADOW_RADIUS = 16;
const CARD_SHADOW_OFFSET_Y = 6;
const CARD_ELEVATION = 3;
const PRESSED_OPACITY = 0.85;

export function createJoinOptionCardStyle(theme: Theme, isPressed: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    backgroundColor: platformCardColors.surface,
    shadowColor: platformCardColors.shadow,
    shadowOpacity: CARD_SHADOW_OPACITY,
    shadowRadius: CARD_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: CARD_SHADOW_OFFSET_Y },
    elevation: CARD_ELEVATION,
    opacity: isPressed ? PRESSED_OPACITY : 1,
  };
}

export function createIconTileStyle(theme: Theme, tileColor: string): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: tileColor,
  };
}

export const JOIN_OPTION_TEXT_STYLE: ViewStyle = { flex: 1 };
