import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { createOccupancyFillStyle, createOccupancyTrackStyle } from './OccupancyBar.styles';

interface OccupancyBarProps {
  /** De 0 a 100. */
  percent: number;
}

/** Barra de la tarjeta «Ocupación»; el valor ya está escrito en la cifra, así que no se anuncia. */
export function OccupancyBar({ percent }: Readonly<OccupancyBarProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={createOccupancyTrackStyle(theme)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={createOccupancyFillStyle(theme, percent)} />
    </View>
  );
}
