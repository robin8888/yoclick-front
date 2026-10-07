import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import {
  ReportsGetCenterReportPeriod,
  type CenterReportResponseDto,
} from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { IncomeByMonthCard } from '../components/IncomeByMonthCard';
import { InactiveClientsNotice } from '../components/InactiveClientsNotice';
import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { ReportKpiGrid } from '../components/ReportKpiGrid';
import { RetentionCard } from '../components/RetentionCard';
import { ServiceOccupancyCard } from '../components/ServiceOccupancyCard';
import { StaffReportCard } from '../components/StaffReportCard';
import { useCenterReport } from '../hooks/useCenterReport';

const PERIOD_OPTIONS = [
  { value: ReportsGetCenterReportPeriod.week, label: i18n.t('centerAdmin.reports.periodWeek') },
  { value: ReportsGetCenterReportPeriod.month, label: i18n.t('centerAdmin.reports.periodMonth') },
  {
    value: ReportsGetCenterReportPeriod.quarter,
    label: i18n.t('centerAdmin.reports.periodQuarter'),
  },
];

function ReportSections({
  report,
  clientWord,
}: Readonly<{ report: CenterReportResponseDto; clientWord: string }>): React.JSX.Element {
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const inactiveClientWord =
    report.inactiveClientCount === 1 ? vocabulary.client.singular : clientWord;

  return (
    <View style={REPORT_SECTION_STYLE}>
      <ReportKpiGrid report={report} clientWord={clientWord} />
      <InactiveClientsNotice
        inactiveCount={report.inactiveClientCount}
        clientWord={inactiveClientWord}
      />
      <IncomeByMonthCard incomeByMonth={report.incomeByMonth} />
      <ServiceOccupancyCard services={report.services} />
      <StaffReportCard staff={report.staff} staffWord={vocabulary.staff.singular} />
      <RetentionCard cohorts={report.retentionByJoinMonth} />
    </View>
  );
}

/** Prototipo `areports`: ingresos, ocupación, retención, inactivos y horas por instructor. */
export function ReportsScreen(): React.JSX.Element {
  const router = useRouter();
  const [period, setPeriod] = useState<ReportsGetCenterReportPeriod>('month');
  const report = useCenterReport(period);
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.reports.title')}
      subtitle={i18n.t('centerAdmin.reports.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <SegmentedControl options={PERIOD_OPTIONS} selectedValue={period} onValueChange={setPeriod} />
      {report.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {report.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.reports.errorTitle')}
          error={report.error}
          onRetry={() => void report.refetch()}
          isRetrying={report.isFetching}
        />
      ) : null}
      {report.data === undefined ? null : (
        <ReportSections report={report.data} clientWord={clientWord} />
      )}
    </ScreenTemplate>
  );
}
