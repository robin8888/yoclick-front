import { useState } from 'react';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { PlatformChargeReportResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatEuros } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { usePlatformChargeReport } from '../hooks/usePlatformChargeReport';
import { useShareChargesCsv } from '../hooks/useShareChargesCsv';
import {
  canShiftToNextPeriod,
  formatMonthLabel,
  formatPeriodLabel,
  getCurrentMonthKey,
  getPeriodRange,
  shiftPeriod,
  type MonthRange,
  type ReportPeriodKind,
} from '../model/charge-period';
import { PeriodNavigator } from './PeriodNavigator';
import { PlatformTabs } from './PlatformTabs';
import { Panel } from './Panel';

const REPORT_STYLE = { gap: 16 } as const;
const PERIOD_OPTIONS = [
  { value: 'month', label: i18n.t('platform.reports.month') },
  { value: 'quarter', label: i18n.t('platform.reports.quarter') },
] as const;

type Report = PlatformChargeReportResponseDto;

function TotalLine({
  label,
  value,
}: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <Text accessibilityLabel={`${label}: ${value}`}>
      {label}: <Text variant="bodyStrong">{value}</Text>
    </Text>
  );
}

function ReportTotals({ report }: Readonly<{ report: Report }>): React.JSX.Element {
  const { totals } = report;

  return (
    <Panel>
      <Text variant="titleMd">{i18n.t('platform.reports.totalsTitle')}</Text>
      <TotalLine label={i18n.t('platform.reports.base')} value={formatEuros(totals.baseCents)} />
      <TotalLine label={i18n.t('platform.reports.vat')} value={formatEuros(totals.vatCents)} />
      <TotalLine label={i18n.t('platform.reports.total')} value={formatEuros(totals.totalCents)} />
      {totals.stripeFeeCents > 0 ? (
        <TotalLine
          label={i18n.t('platform.reports.fees')}
          value={formatEuros(totals.stripeFeeCents)}
        />
      ) : null}
      <Text color="ink2">
        {i18n.t('platform.reports.chargeCount', { count: totals.chargeCount })}
      </Text>
    </Panel>
  );
}

function ReportMonths({ report }: Readonly<{ report: Report }>): React.JSX.Element {
  return (
    <Panel>
      <Text variant="titleMd">{i18n.t('platform.reports.byMonth')}</Text>
      {report.months.map((month) => (
        <View key={month.month}>
          <Text variant="bodyStrong">{formatMonthLabel(month.month)}</Text>
          <Text color="ink2">
            {i18n.t('platform.reports.monthLine', {
              base: formatEuros(month.baseCents),
              vat: formatEuros(month.vatCents),
              count: month.chargeCount,
            })}
          </Text>
        </View>
      ))}
    </Panel>
  );
}

function ShareCsvButton({ range }: Readonly<{ range: MonthRange }>): React.JSX.Element {
  const share = useShareChargesCsv();

  return (
    <>
      <Button
        label={i18n.t('platform.reports.exportCsv')}
        leadingIconName="download"
        isFullWidth
        isLoading={share.isPreparing}
        onPress={() => {
          share.shareCsv(range);
        }}
      />
      <Text variant="caption" color="ink2">
        {i18n.t('platform.reports.exportHint')}
      </Text>
      <ProblemModal
        message={share.shareErrorMessage}
        onDismiss={share.clearError}
        {...getProblemModalCopy()}
      />
    </>
  );
}

function ReportContent({ range }: Readonly<{ range: MonthRange }>): React.JSX.Element {
  const report = usePlatformChargeReport(range);

  if (report.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.reports.errorTitle')}
        error={report.error}
        onRetry={() => void report.refetch()}
        isRetrying={report.isFetching}
      />
    );
  }
  if (report.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  return (
    <>
      <ReportTotals report={report.data} />
      {report.data.months.length === 0 ? (
        <Text color="ink2">{i18n.t('platform.reports.empty')}</Text>
      ) : (
        <ReportMonths report={report.data} />
      )}
      <ShareCsvButton range={range} />
    </>
  );
}

/** El informe para el gestor: base, IVA y total cobrados por mes o por trimestre, y su CSV. */
export function ReportsTab(): React.JSX.Element {
  const currentMonthKey = getCurrentMonthKey(new Date());
  const [kind, setKind] = useState<ReportPeriodKind>('quarter');
  const [monthKey, setMonthKey] = useState(currentMonthKey);

  return (
    <View style={REPORT_STYLE}>
      <PlatformTabs options={PERIOD_OPTIONS} selectedValue={kind} onValueChange={setKind} />
      <PeriodNavigator
        periodLabel={formatPeriodLabel(kind, monthKey)}
        canGoNext={canShiftToNextPeriod(kind, monthKey, currentMonthKey)}
        onPreviousPress={() => {
          setMonthKey(shiftPeriod(kind, monthKey, -1));
        }}
        onNextPress={() => {
          setMonthKey(shiftPeriod(kind, monthKey, 1));
        }}
      />
      <ReportContent range={getPeriodRange(kind, monthKey)} />
      <Text variant="caption" color="ink2">
        {i18n.t('platform.reports.note')}
      </Text>
    </View>
  );
}
