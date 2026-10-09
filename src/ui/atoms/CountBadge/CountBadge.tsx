import { Text as NativeText, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { useTextStyle } from '../Text';
import { createCountBadgeStyle, createCountTextStyle, formatBadgeCount } from './CountBadge.styles';

interface CountBadgeProps {
  /** Con 0 no se dibuja nada. */
  count: number;
}

const MAX_BADGE_FONT_MULTIPLIER = 1.2;

/** El circulito rojo con el número de avisos sin leer; el número se lee en la etiqueta del botón. */
export function CountBadge({ count }: Readonly<CountBadgeProps>): React.JSX.Element | null {
  const theme = useTheme();
  const textStyle = useTextStyle({ variant: 'caption', color: 'onDanger', align: 'center' });
  if (count <= 0) return null;

  return (
    <View style={createCountBadgeStyle(theme)} accessible={false} importantForAccessibility="no">
      {/* La altura de línea es la del círculo y sin relleno de fuente: así el número queda centrado. */}
      <NativeText
        maxFontSizeMultiplier={MAX_BADGE_FONT_MULTIPLIER}
        style={createCountTextStyle(textStyle)}
      >
        {formatBadgeCount(count)}
      </NativeText>
    </View>
  );
}
