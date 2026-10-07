import { View } from 'react-native';

import type { CenterReportResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { describeIncomeChange, formatReportPercent, type IncomeChange } from '../model/report-view';
import { createReportCardStyle, KPI_GRID_STYLE, KPI_TILE_STYLE } from './ReportCard.styles';

interface KpiTileProps {
  label: string;
  value: string;
  caption: string;
}

function KpiTile({ label, value, caption }: Readonly<KpiTileProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}. ${caption}`}
      style={[createReportCardStyle(theme), KPI_TILE_STYLE]}
    >
      <Text variant="overline" color="ink2">
        {label}
      </Text>
      <Text variant="titleLg">{value}</Text>
      <Text variant="caption" color="ink2">
        {caption}
      </Text>
    </View>
  );
}

function describeChangeText(change: IncomeChange): string {
  if (change.kind === 'up')
    return i18n.t('centerAdmin.reports.incomeUp', { percent: change.percent });
  if (change.kind === 'down') {
    return i18n.t('centerAdmin.reports.incomeDown', { percent: change.percent });
  }
  return change.kind === 'same'
    ? i18n.t('centerAdmin.reports.incomeSame')
    : i18n.t('centerAdmin.reports.incomeUnknown');
}

interface ReportKpiGridProps {
  report: CenterReportResponseDto;
  clientWord: string;
}

/** Prototipo `areports`: ingresos, ocupación, retención y activos del periodo. */
export function ReportKpiGrid({
  report,
  clientWord,
}: Readonly<ReportKpiGridProps>): React.JSX.Element {
  const incomeChange = describeIncomeChange(
    report.estimatedIncomeCents,
    report.previousEstimatedIncomeCents,
  );

  return (
    <View style={KPI_GRID_STYLE}>
      <KpiTile
        label={i18n.t('centerAdmin.reports.incomeLabel')}
        value={formatEuros(report.estimatedIncomeCents)}
        caption={describeChangeText(incomeChange)}
      />
      <KpiTile
        label={i18n.t('centerAdmin.reports.occupancyLabel')}
        value={formatReportPercent(report.averageOccupancyPercent)}
        caption={i18n.t('centerAdmin.reports.occupancyHint')}
      />
      <KpiTile
        label={i18n.t('centerAdmin.reports.retentionLabel')}
        value={formatReportPercent(report.retentionThreeMonthsPercent)}
        caption={i18n.t('centerAdmin.reports.retentionHint')}
      />
      <KpiTile
        label={i18n.t('centerAdmin.reports.activeLabel')}
        value={i18n.t('centerAdmin.reports.activeValue', {
          count: report.activeClientCount,
          clientWord,
        })}
        caption={i18n.t('centerAdmin.reports.activeHint')}
      />
    </View>
  );
}
