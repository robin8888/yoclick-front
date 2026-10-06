import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const SWATCH_SIZE = 40;
const SELECTED_RING_WIDTH = 3;

export const BRAND_SWATCH_SECTION_STYLE: ViewStyle = { gap: 12 };

export const BRAND_SWATCH_LIST_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
};

export function createBrandSwatchStyle(
  theme: Theme,
  swatchColor: string,
  isSelected: boolean,
): ViewStyle {
  return {
    width: Math.max(SWATCH_SIZE, MIN_TOUCH_TARGET_SIZE),
    height: Math.max(SWATCH_SIZE, MIN_TOUCH_TARGET_SIZE),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: swatchColor,
    borderWidth: SELECTED_RING_WIDTH,
    // El aro con la tinta del tema marca la elección sin depender solo del color del relleno.
    borderColor: isSelected ? theme.colors.ink : 'transparent',
  };
}
