import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export const CHECKBOX_BOX_SIZE = 24;
const CHECKBOX_BORDER_WIDTH = 2;

export function createCheckboxHitAreaStyle(): ViewStyle {
  return {
    width: MIN_TOUCH_TARGET_SIZE,
    height: MIN_TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

interface CheckboxBoxRequest {
  theme: Theme;
  isChecked: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
}

// El estado marcado se ve por la marca de verificación, no solo por el relleno de color.
export function createCheckboxBoxStyle({
  theme,
  isChecked,
  isInvalid,
  isDisabled,
}: CheckboxBoxRequest): ViewStyle {
  const { colors } = theme;
  const borderColor = isInvalid ? colors.danger : colors.lineStrong;
  const filledColor = isDisabled ? colors.lineStrong : colors.brand;
  return {
    width: CHECKBOX_BOX_SIZE,
    height: CHECKBOX_BOX_SIZE,
    borderRadius: theme.radius.sm,
    borderWidth: CHECKBOX_BORDER_WIDTH,
    borderColor: isChecked ? filledColor : borderColor,
    backgroundColor: isChecked ? filledColor : colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
