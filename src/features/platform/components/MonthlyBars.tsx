import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  BAR_COLUMN_STYLE,
  BARS_HEADER_STYLE,
  BARS_ROW_STYLE,
  createBarsCardStyle,
  createBarStyle,
} from './MonthlyBars.styles';

interface MonthlyBarsProps {
  title: string;
  months: readonly { month: string; count: number }[];
}

const MONTH_INITIALS = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const;
const MONTH_NUMBER_START = 5;

function readMonthInitial(monthKey: string): string {
  return MONTH_INITIALS[Number(monthKey.slice(MONTH_NUMBER_START)) - 1] ?? '';
}

/** Barras sencillas de los últimos meses. Cada barra lleva su cifra para el lector de pantalla. */
export function MonthlyBars({ title, months }: Readonly<MonthlyBarsProps>): React.JSX.Element {
  const theme = useTheme();
  const highest = Math.max(1, ...months.map(({ count }) => count));
  const total = months.reduce((sum, { count }) => sum + count, 0);

  return (
    <View style={createBarsCardStyle(theme)}>
      <View style={BARS_HEADER_STYLE}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('platform.overview.barsTotal', { total })}
        </Text>
      </View>
      <View style={BARS_ROW_STYLE}>
        {months.map(({ month, count }, index) => (
          <View
            key={month}
            style={BAR_COLUMN_STYLE}
            accessible
            accessibilityLabel={i18n.t('platform.overview.barLabel', { month, count })}
          >
            <Text variant="caption" color="ink2">
              {String(count)}
            </Text>
            <View
              style={createBarStyle(theme, {
                ratio: count / highest,
                isLatest: index === months.length - 1,
              })}
            />
            <Text variant="caption" color="ink2">
              {readMonthInitial(month)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
