import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createMetricCardStyle,
  createMetricIconTileStyle,
  METRIC_HEADER_STYLE,
  type MetricTone,
} from './MetricCard.styles';

interface MetricCardProps {
  label: string;
  value: number;
  iconName?: IconName;
  /** `warning` y `danger` solo se aplican con la cifra distinta de cero: avisan de algo que mirar. */
  tone?: MetricTone;
  /** La cifra principal de la pantalla: ocupa todo el ancho y se escribe más grande. */
  isFeatured?: boolean;
}

/** Una cifra grande con su rótulo. El lector de pantalla la lee junta: «Centros en total, 12». */
export function MetricCard({
  label,
  value,
  iconName,
  tone = 'default',
  isFeatured = false,
}: Readonly<MetricCardProps>): React.JSX.Element {
  const theme = useTheme();
  const shownTone = value === 0 ? 'default' : tone;
  const iconColor = shownTone === 'default' ? 'ink2' : shownTone;

  return (
    <View
      style={createMetricCardStyle(theme, { tone: shownTone, isFeatured })}
      accessible
      accessibilityLabel={`${label}, ${String(value)}`}
    >
      <View style={METRIC_HEADER_STYLE}>
        <Text variant="caption" color="ink2">
          {label}
        </Text>
        {iconName === undefined ? null : (
          <View style={createMetricIconTileStyle(theme)}>
            <Icon name={iconName} size="navigation" color={iconColor} />
          </View>
        )}
      </View>
      <Text variant={isFeatured ? 'display' : 'metric'}>{String(value)}</Text>
    </View>
  );
}
