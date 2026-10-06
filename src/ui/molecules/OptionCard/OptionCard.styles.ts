import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const CARD_BORDER_WIDTH = 2;
const RADIO_SIZE = 24;
const RADIO_DOT_SIZE = 12;
const HALF = 0.5;
const CHECKBOX_RADIUS = 6;

export function createOptionCardStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: CARD_BORDER_WIDTH,
    // Elegida: fondo suave y borde con el color del centro, además del punto del selector.
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    backgroundColor: isSelected ? theme.colors.brandSoft : theme.colors.surface,
  };
}

export function createRadioStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIO_SIZE * HALF,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.lineStrong,
  };
}

export function createRadioDotStyle(theme: Theme): ViewStyle {
  return {
    width: RADIO_DOT_SIZE,
    height: RADIO_DOT_SIZE,
    borderRadius: RADIO_DOT_SIZE * HALF,
    backgroundColor: theme.colors.brand,
  };
}

export const OPTION_CARD_TEXT_STYLE: ViewStyle = { flex: 1 };

export function createCheckboxStyle(theme: Theme, isSelected: boolean): ViewStyle {
  return {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CHECKBOX_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.lineStrong,
    backgroundColor: isSelected ? theme.colors.brand : 'transparent',
  };
}
