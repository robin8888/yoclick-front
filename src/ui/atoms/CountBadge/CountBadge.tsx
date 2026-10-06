import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Text } from '../Text';
import { createCountBadgeStyle, formatBadgeCount } from './CountBadge.styles';

interface CountBadgeProps {
  /** Con 0 no se dibuja nada. */
  count: number;
}

/** El circulito rojo con el número de avisos sin leer; el número se lee en la etiqueta del botón. */
export function CountBadge({ count }: Readonly<CountBadgeProps>): React.JSX.Element | null {
  const theme = useTheme();
  if (count <= 0) return null;

  return (
    <View style={createCountBadgeStyle(theme)} accessible={false} importantForAccessibility="no">
      <Text variant="caption" color="onDanger">
        {formatBadgeCount(count)}
      </Text>
    </View>
  );
}
