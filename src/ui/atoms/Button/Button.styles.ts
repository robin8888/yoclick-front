import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

import type { ButtonSize, ButtonVariant } from './Button.types';

// 48 px es la altura estándar del sistema de diseño; `sm` baja al mínimo táctil, nunca por debajo.
const BUTTON_MIN_HEIGHTS: Readonly<Record<ButtonSize, number>> = {
  sm: MIN_TOUCH_TARGET_SIZE,
  md: 48,
  lg: 56,
};
const OUTLINE_BORDER_WIDTH = 1.5;

// Colores de contenido que aceptan a la vez Text, Icon y Spinner.
type ButtonContentColor = 'onBrand' | 'ink' | 'ink2' | 'brandInk' | 'onDanger' | 'surface';

interface ButtonColors {
  backgroundColor: string;
  borderColor: string;
  contentColor: ButtonContentColor;
}

interface ButtonStyleRequest {
  theme: Theme;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled: boolean;
  isFullWidth?: boolean;
}

function resolveVariantColors(theme: Theme, variant: ButtonVariant): ButtonColors {
  const { colors } = theme;
  const transparent = 'transparent';
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.brand, borderColor: colors.brand, contentColor: 'onBrand' };
    case 'secondary':
      return {
        backgroundColor: colors.surface2,
        borderColor: colors.surface2,
        contentColor: 'ink',
      };
    case 'outline':
      return { backgroundColor: transparent, borderColor: colors.lineStrong, contentColor: 'ink' };
    case 'ghost':
      return { backgroundColor: transparent, borderColor: transparent, contentColor: 'brandInk' };
    case 'dark':
      return { backgroundColor: colors.ink, borderColor: colors.ink, contentColor: 'surface' };
    case 'danger':
      return {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
        contentColor: 'onDanger',
      };
  }
}

// Un botón desactivado se apaga con superficie y tinta secundaria (sin bajar la opacidad del
// texto): así sigue legible para quien lo necesite y no depende solo del color de marca.
function resolveDisabledColors(theme: Theme, variant: ButtonVariant): ButtonColors {
  const isFilled =
    variant === 'primary' || variant === 'danger' || variant === 'secondary' || variant === 'dark';
  return {
    backgroundColor: isFilled ? theme.colors.surface2 : 'transparent',
    borderColor: variant === 'outline' ? theme.colors.line : 'transparent',
    contentColor: 'ink2',
  };
}

interface ButtonPresentation {
  style: ViewStyle;
  contentColor: ButtonContentColor;
}

export function resolveButtonPresentation({
  theme,
  variant = 'primary',
  size = 'md',
  isDisabled,
  isFullWidth = false,
}: ButtonStyleRequest): ButtonPresentation {
  const { backgroundColor, borderColor, contentColor } = isDisabled
    ? resolveDisabledColors(theme, variant)
    : resolveVariantColors(theme, variant);
  const style: ViewStyle = {
    minHeight: BUTTON_MIN_HEIGHTS[size],
    minWidth: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: size === 'sm' ? theme.space[4] : theme.space[6],
    paddingVertical: theme.space[2],
    borderRadius: theme.radius.md,
    borderWidth: variant === 'outline' ? OUTLINE_BORDER_WIDTH : 0,
    borderColor,
    backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    alignSelf: isFullWidth ? 'stretch' : 'flex-start',
  };
  return { style, contentColor };
}
