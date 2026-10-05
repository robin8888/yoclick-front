import type { ImageStyle, ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, platformCardColors, type Theme } from '@/shared/theme';

const RESULT_TILE_SIZE = 52;

export function createCenterResultCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    backgroundColor: platformCardColors.surface,
  };
}

export function createCenterResultTileStyle(theme: Theme, brandHexColor: string): ViewStyle {
  return {
    width: RESULT_TILE_SIZE,
    height: RESULT_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    backgroundColor: brandHexColor,
  };
}

export const RESULT_LOGO_STYLE: ImageStyle = { width: '100%', height: '100%' };

export const RESULT_TEXT_STYLE: ViewStyle = { flex: 1 };
