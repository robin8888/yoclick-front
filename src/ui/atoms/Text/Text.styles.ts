import { useMemo } from 'react';
import type { TextStyle } from 'react-native';

import { resolveFontFaceName, useTheme, type Theme } from '@/shared/theme';

import type { TextColor, TextVariant } from './Text.types';

interface TextStyleRequest {
  theme: Theme;
  variant: TextVariant;
  color: TextColor;
}

export function createTextStyle({ theme, variant, color }: TextStyleRequest): TextStyle {
  const { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } = theme.type[variant];
  return {
    color: theme.colors[color],
    // El peso va dentro del nombre de la fuente cargada; `fontWeight` aparte rompe Android.
    fontFamily: resolveFontFaceName({ fontFamily, fontWeight }),
    fontSize,
    lineHeight,
    letterSpacing,
    ...(variant === 'metric' ? { fontVariant: ['tabular-nums'] as const } : {}),
    // Los rótulos se escriben en minúscula y se muestran en mayúsculas (sistema de diseño).
    ...(variant === 'overline' ? { textTransform: 'uppercase' as const } : {}),
  };
}

export function useTextStyle(variant: TextVariant, color: TextColor): TextStyle {
  const theme = useTheme();
  return useMemo(() => createTextStyle({ theme, variant, color }), [theme, variant, color]);
}
