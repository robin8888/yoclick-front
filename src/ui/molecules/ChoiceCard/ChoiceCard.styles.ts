import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, platformCardColors } from '@/shared/theme';

const CARD_BORDER_WIDTH = 2.5;
const CARD_RADIUS = 14;
const CARD_VERTICAL_PADDING = 12;
const CARD_HORIZONTAL_PADDING = 16;
const INDICATOR_SIZE = 24;
const INDICATOR_BORDER_WIDTH = 2;
const CHECKBOX_RADIUS = 6;
const RADIO_RADIUS = 12;

export function createChoiceCardStyle(isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingVertical: CARD_VERTICAL_PADDING,
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    borderRadius: CARD_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: isSelected ? platformCardColors.selectedBorder : 'transparent',
    backgroundColor: platformCardColors.surface,
  };
}

export const CHOICE_CARD_TEXT_STYLE: ViewStyle = { flex: 1 };

interface IndicatorStyleRequest {
  indicator: 'radio' | 'checkbox';
  isSelected: boolean;
}

export function createChoiceIndicatorStyle({
  indicator,
  isSelected,
}: IndicatorStyleRequest): ViewStyle {
  return {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: indicator === 'radio' ? RADIO_RADIUS : CHECKBOX_RADIUS,
    borderWidth: INDICATOR_BORDER_WIDTH,
    borderColor: isSelected ? platformCardColors.selectedBorder : platformCardColors.icon,
    // Elegida: relleno dorado con la marca en burdeos; sin elegir, solo el contorno burdeos.
    backgroundColor: isSelected ? platformCardColors.selectedBorder : 'transparent',
  };
}

export const CHOICE_CARD_LIST_STYLE: ViewStyle = { gap: 10 };
