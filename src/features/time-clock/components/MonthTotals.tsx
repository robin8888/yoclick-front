import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatWorkedMinutes } from '../model/worked-time';
import { createTotalsRowStyle, createTotalTileStyle } from './TimeClock.styles';

interface MonthTotalsProps {
  workedMinutes: number;
  daysWorked: number;
  editedCount: number;
}

interface TotalTileProps {
  label: string;
  value: string;
}

function TotalTile({ label, value }: Readonly<TotalTileProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createTotalTileStyle(theme)} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
      <Text variant="titleMd">{value}</Text>
    </View>
  );
}

/** Lo que cuenta el mes de un vistazo: horas trabajadas, días con fichaje y fichajes corregidos. */
export function MonthTotals({
  workedMinutes,
  daysWorked,
  editedCount,
}: Readonly<MonthTotalsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createTotalsRowStyle(theme)}>
      <TotalTile
        label={i18n.t('timeClock.workedLabel')}
        value={formatWorkedMinutes(workedMinutes)}
      />
      <TotalTile label={i18n.t('timeClock.daysLabel')} value={String(daysWorked)} />
      <TotalTile label={i18n.t('timeClock.editedLabel')} value={String(editedCount)} />
    </View>
  );
}
