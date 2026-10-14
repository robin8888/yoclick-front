import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatWorkedMinutes } from '../model/worked-time';
import { createHeroCardStyle, createHeroStatsStyle, createHeroStatStyle } from './TimeClock.styles';

interface MonthTotalsProps {
  workedMinutes: number;
  daysWorked: number;
  editedCount: number;
}

interface HeroStatProps {
  label: string;
  value: string;
}

function HeroStat({ label, value }: Readonly<HeroStatProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHeroStatStyle(theme)} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
      <Text variant="titleMd">{value}</Text>
    </View>
  );
}

/** El mes en una tarjeta: las horas trabajadas en grande y, debajo, los días y lo corregido. */
export function MonthTotals({
  workedMinutes,
  daysWorked,
  editedCount,
}: Readonly<MonthTotalsProps>): React.JSX.Element {
  const theme = useTheme();
  const worked = formatWorkedMinutes(workedMinutes);

  return (
    <View style={createHeroCardStyle(theme)}>
      <View accessible accessibilityLabel={`${i18n.t('timeClock.workedLabel')}: ${worked}`}>
        <Text variant="caption" color="ink2">
          {i18n.t('timeClock.workedLabel')}
        </Text>
        <Text variant="display" color="brandInk">
          {worked}
        </Text>
      </View>
      <View style={createHeroStatsStyle(theme)}>
        <HeroStat label={i18n.t('timeClock.daysLabel')} value={String(daysWorked)} />
        <HeroStat label={i18n.t('timeClock.editedLabel')} value={String(editedCount)} />
      </View>
    </View>
  );
}
