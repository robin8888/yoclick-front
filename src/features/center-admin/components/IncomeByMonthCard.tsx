import { View } from 'react-native';

import type { CenterReportResponseDtoIncomeByMonthItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatReportMonth, scaleToPercent } from '../model/report-view';
import {
  AXIS_LABEL_STYLE,
  AXIS_STYLE,
  CHART_COLUMN_STYLE,
  CHART_STYLE,
  createColumnFillStyle,
  createReportCardStyle,
  REPORT_HEADER_ROW_STYLE,
} from './ReportCard.styles';

interface IncomeChartProps {
  incomeByMonth: readonly CenterReportResponseDtoIncomeByMonthItem[];
}

/** El gráfico no se lee con el lector de pantalla: se resume en una frase con todos los meses. */
function IncomeChart({ incomeByMonth }: Readonly<IncomeChartProps>): React.JSX.Element {
  const theme = useTheme();
  const highestIncome = Math.max(...incomeByMonth.map(({ incomeCents }) => incomeCents));
  const chartSummary = incomeByMonth
    .map(({ month, incomeCents }) => `${formatReportMonth(month)} ${formatEuros(incomeCents)}`)
    .join(', ');

  return (
    <View
      accessible
      role="img"
      accessibilityLabel={i18n.t('centerAdmin.reports.incomeChartLabel', { summary: chartSummary })}
    >
      <View style={CHART_STYLE}>
        {incomeByMonth.map(({ month, incomeCents }) => (
          <View key={month} style={CHART_COLUMN_STYLE}>
            <View
              style={createColumnFillStyle(theme, scaleToPercent(incomeCents, highestIncome))}
            />
          </View>
        ))}
      </View>
      <View style={AXIS_STYLE}>
        {incomeByMonth.map(({ month }) => (
          <View key={month} style={AXIS_LABEL_STYLE}>
            <Text variant="caption" color="ink2">
              {formatReportMonth(month)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Prototipo `areports`, «Ingresos por mes»: una columna por mes, la más alta ocupa todo el alto. */
export function IncomeByMonthCard({
  incomeByMonth,
}: Readonly<IncomeChartProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createReportCardStyle(theme)}>
      <View style={REPORT_HEADER_ROW_STYLE}>
        <Text variant="titleMd" role="heading">
          {i18n.t('centerAdmin.reports.incomeByMonthTitle')}
        </Text>
      </View>
      <IncomeChart incomeByMonth={incomeByMonth} />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.reports.incomeNote')}
      </Text>
    </View>
  );
}
