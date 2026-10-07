import { View } from 'react-native';

import type { CenterReportResponseDtoRetentionByJoinMonthItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatReportMonth, formatReportPercent } from '../model/report-view';
import {
  createReportCardStyle,
  createTableRowStyle,
  TABLE_NUMBER_COLUMN_STYLE,
  TABLE_TEXT_COLUMN_STYLE,
} from './ReportCard.styles';

function CohortRow({
  cohort,
}: Readonly<{ cohort: CenterReportResponseDtoRetentionByJoinMonthItem }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible style={createTableRowStyle(theme)}>
      <View style={TABLE_TEXT_COLUMN_STYLE}>
        <Text variant="body">{formatReportMonth(cohort.month)}</Text>
      </View>
      <View style={TABLE_NUMBER_COLUMN_STYLE}>
        <Text variant="body">{String(cohort.joinedCount)}</Text>
      </View>
      <View style={TABLE_NUMBER_COLUMN_STYLE}>
        <Text variant="body">{formatReportPercent(cohort.retainedAfterOneMonthPercent)}</Text>
      </View>
      <View style={TABLE_NUMBER_COLUMN_STYLE}>
        <Text variant="body">{formatReportPercent(cohort.retainedAfterThreeMonthsPercent)}</Text>
      </View>
    </View>
  );
}

/** Prototipo `areports`, «Retención por mes de alta»: cuántos de cada alta siguen viniendo. */
export function RetentionCard({
  cohorts,
}: Readonly<{
  cohorts: readonly CenterReportResponseDtoRetentionByJoinMonthItem[];
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createReportCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.reports.retentionTitle')}
      </Text>
      <View style={createTableRowStyle(theme)}>
        <View style={TABLE_TEXT_COLUMN_STYLE}>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.reports.retentionColumnMonth')}
          </Text>
        </View>
        <View style={TABLE_NUMBER_COLUMN_STYLE}>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.reports.retentionColumnJoined')}
          </Text>
        </View>
        <View style={TABLE_NUMBER_COLUMN_STYLE}>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.reports.retentionColumnOneMonth')}
          </Text>
        </View>
        <View style={TABLE_NUMBER_COLUMN_STYLE}>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.reports.retentionColumnThreeMonths')}
          </Text>
        </View>
      </View>
      {cohorts.map((cohort) => (
        <CohortRow key={cohort.month} cohort={cohort} />
      ))}
    </View>
  );
}
