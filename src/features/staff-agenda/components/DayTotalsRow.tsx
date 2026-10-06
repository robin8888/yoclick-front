import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatOccupiedTime, type DayTotals } from '../model/day-timeline';
import { createTotalCardStyle, TOTALS_ROW_STYLE } from './DayTotalsRow.styles';

interface TotalCardProps {
  value: string;
  caption: string;
}

function TotalCard({ value, caption }: Readonly<TotalCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible accessibilityLabel={`${value} ${caption}`} style={createTotalCardStyle(theme)}>
      <Text variant="titleLg">{value}</Text>
      <Text variant="caption" color="ink2">
        {caption}
      </Text>
    </View>
  );
}

/** Prototipo `iagenda`: «6 citas · 5,5 h ocupadas · 2 huecos» del día. */
export function DayTotalsRow({ totals }: Readonly<{ totals: DayTotals }>): React.JSX.Element {
  return (
    <View style={TOTALS_ROW_STYLE}>
      <TotalCard
        value={String(totals.appointmentCount)}
        caption={i18n.t('staffAgenda.instructor.appointments', { count: totals.appointmentCount })}
      />
      <TotalCard
        value={formatOccupiedTime(totals.occupiedMinutes)}
        caption={i18n.t('staffAgenda.instructor.occupied')}
      />
      <TotalCard
        value={String(totals.freeSlotCount)}
        caption={i18n.t('staffAgenda.instructor.freeSlots', { count: totals.freeSlotCount })}
      />
    </View>
  );
}
