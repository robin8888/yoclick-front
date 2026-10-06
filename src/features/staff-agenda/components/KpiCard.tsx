import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createKpiCardStyle } from './KpiCard.styles';
import { OccupancyBar } from './OccupancyBar';

interface KpiCardProps {
  label: string;
  value: string;
  caption?: string | undefined;
  /** De 0 a 100: dibuja la barra de progreso bajo la cifra (la ocupación). */
  progressPercent?: number | undefined;
}

/** Prototipo `aagenda` (`kpi`): rótulo en mayúsculas, cifra grande y una línea de contexto. */
export function KpiCard({
  label,
  value,
  caption,
  progressPercent,
}: Readonly<KpiCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createKpiCardStyle(theme)} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="overline" color="ink2">
        {label}
      </Text>
      <Text variant="metric" maxFontSizeMultiplier={1.3}>
        {value}
      </Text>
      {progressPercent === undefined ? null : <OccupancyBar percent={progressPercent} />}
      {caption === undefined ? null : (
        <Text variant="caption" color="ink2">
          {caption}
        </Text>
      )}
    </View>
  );
}
