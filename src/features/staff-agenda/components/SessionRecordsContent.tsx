import type { SessionRecordsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';

import { SessionRecordRow } from './SessionRecordRow';
import { StaffTotalsCard } from './StaffTotalsCard';

/** Totales por profesional y, debajo, cada clase registrada. */
export function SessionRecordsContent({
  records,
}: Readonly<{ records: SessionRecordsResponseDto }>): React.JSX.Element {
  if (records.records.length === 0) {
    return (
      <EmptyState
        iconName="clock"
        title={i18n.t('staffAgenda.records.emptyTitle')}
        description={i18n.t('staffAgenda.records.emptyDescription')}
        actionLabel={i18n.t('staffAgenda.tabs.agenda')}
        onActionPress={() => undefined}
      />
    );
  }
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.records.totalsTitle')}</Text>
      {records.totals.map((total) => (
        <StaffTotalsCard key={total.staffMembershipId} total={total} />
      ))}
      <Text variant="titleMd">{i18n.t('staffAgenda.records.recordsTitle')}</Text>
      {records.records.map((record) => (
        <SessionRecordRow key={record.booking.id} record={record} timeZone={records.timezone} />
      ))}
    </>
  );
}
