import { useMemo } from 'react';
import type { TextStyle } from 'react-native';

import { resolveFontFaceName, useTheme, type Theme } from '@/shared/theme';

import type { TextColor, TextVariant } from './Text.types';

interface TextStyleRequest {
  theme: Theme;
  variant: TextVariant;
  color: TextColor;
  align?: 'left' | 'center' | undefined;
  tintColor?: string | undefined;
}

export function createTextStyle({
  theme,
  variant,
  color,
  align,
  tintColor,
}: TextStyleRequest): TextStyle {
  const { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } = theme.type[variant];
  return {
    color: tintColor ?? theme.colors[color],
    // El peso va dentro del nombre de la fuente cargada; `fontWeight` aparte rompe Android.
    fontFamily: resolveFontFaceName({ fontFamily, fontWeight }),
    fontSize,
    lineHeight,
    letterSpacing,
    ...(align === undefined ? {} : { textAlign: align }),
    ...(variant === 'metric' ? { fontVariant: ['tabular-nums'] as const } : {}),
    // Los rótulos se escriben en minúscula y se muestran en mayúsculas (sistema de diseño).
    ...(variant === 'overline' ? { textTransform: 'uppercase' as const } : {}),
  };
}

export function useTextStyle(request: Omit<TextStyleRequest, 'theme'>): TextStyle {
  const theme = useTheme();
  const { variant, color, align, tintColor } = request;
  return useMemo(
    () => createTextStyle({ theme, variant, color, align, tintColor }),
    [theme, variant, color, align, tintColor],
  );
}
