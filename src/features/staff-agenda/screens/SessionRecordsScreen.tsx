import { useState } from 'react';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { SessionRecordsContent } from '../components/SessionRecordsContent';
import { useRecordsRange, type RecordsRangeDays } from '../hooks/useRecordsRange';
import { useSessionRecords } from '../hooks/useSessionRecords';

const RANGE_OPTIONS = [
  { value: '7', label: i18n.t('staffAgenda.records.last7Days') },
  { value: '30', label: i18n.t('staffAgenda.records.last30Days') },
] as const;

/** El propietario ve qué clases dio cada profesional, con su hora real frente a la prevista. */
export function SessionRecordsScreen(): React.JSX.Element {
  const [rangeDays, setRangeDays] = useState<RecordsRangeDays>('7');
  const range = useRecordsRange(rangeDays);
  const records = useSessionRecords(range);

  return (
    <ScreenTemplate title={i18n.t('staffAgenda.records.title')}>
      <SegmentedControl
        options={RANGE_OPTIONS}
        selectedValue={rangeDays}
        onValueChange={setRangeDays}
      />
      {records.isError ? (
        <LoadErrorState
          title={i18n.t('staffAgenda.records.errorTitle')}
          error={records.error}
          onRetry={() => void records.refetch()}
          isRetrying={records.isFetching}
        />
      ) : null}
      {records.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {records.data === undefined ? null : <SessionRecordsContent records={records.data} />}
    </ScreenTemplate>
  );
}
