import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createMetricCardStyle } from './MetricCard.styles';

interface MetricCardProps {
  label: string;
  value: number;
}

/** Una cifra grande con su rótulo. El lector de pantalla la lee junta: «Centros en total, 12». */
export function MetricCard({ label, value }: Readonly<MetricCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={createMetricCardStyle(theme)}
      accessible
      accessibilityLabel={`${label}, ${String(value)}`}
    >
      <Text variant="metric">{String(value)}</Text>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
    </View>
  );
}
