import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, platformCardColors, type Theme } from '@/shared/theme';

const ICON_TILE_SIZE = 44;
// Mismo grosor elegida o no, para que la tarjeta no salte al elegirla.
const BORDER_WIDTH = 4;
const UNSELECTED_OPACITY = 0.8;
const CHOICE_MARK_SIZE = 30;
const CHOICE_RING_WIDTH = 2;
const HALF = 0.5;

export function createAccountRoleCardStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: BORDER_WIDTH,
    borderColor: isSelected ? platformCardColors.selectedBorder : 'transparent',
    backgroundColor: isSelected ? platformCardColors.selectedSurface : platformCardColors.surface,
    opacity: isSelected ? 1 : UNSELECTED_OPACITY,
  };
}

export function createRoleIconTileStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: isSelected ? platformCardColors.selectedTile : platformCardColors.iconTile,
  };
}

/** El círculo de la derecha: relleno dorado con la marca si está elegida, un aro vacío si no. */
export function createChoiceMarkStyle(isSelected: boolean): ViewStyle {
  return {
    width: CHOICE_MARK_SIZE,
    height: CHOICE_MARK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CHOICE_MARK_SIZE * HALF,
    borderWidth: CHOICE_RING_WIDTH,
    borderColor: isSelected ? platformCardColors.selectedBorder : platformCardColors.unselectedRing,
    backgroundColor: isSelected ? platformCardColors.selectedBorder : 'transparent',
  };
}

export const ROLE_TEXT_STYLE: ViewStyle = { flex: 1 };
