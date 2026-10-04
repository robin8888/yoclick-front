import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

import type { IconColor } from '../Icon';
import type { IconButtonVariant } from './IconButton.types';

interface IconButtonColors {
  backgroundColor: string;
  iconColor: IconColor;
}

export function resolveIconButtonColors(
  theme: Theme,
  variant: IconButtonVariant,
  isDisabled: boolean,
): IconButtonColors {
  if (isDisabled) return { backgroundColor: 'transparent', iconColor: 'ink2' };
  switch (variant) {
    case 'brand':
      return { backgroundColor: theme.colors.brand, iconColor: 'onBrand' };
    case 'tonal':
      return { backgroundColor: theme.colors.surface2, iconColor: 'ink' };
    case 'plain':
      return { backgroundColor: 'transparent', iconColor: 'ink' };
  }
}

export function createIconButtonStyle(theme: Theme, backgroundColor: string): ViewStyle {
  return {
    width: MIN_TOUCH_TARGET_SIZE,
    height: MIN_TOUCH_TARGET_SIZE,
    borderRadius: theme.radius.pill,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
