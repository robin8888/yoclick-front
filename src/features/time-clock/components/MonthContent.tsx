import type { TimeEntryListResponseDto, TimeEntryResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { EmptyState } from '@/ui/molecules/EmptyState';

import type { WorkDay } from '../model/group-entries-by-day';
import { MonthTotals } from './MonthTotals';
import { WorkDayCard } from './WorkDayCard';

interface MonthContentProps {
  month: TimeEntryListResponseDto;
  days: readonly WorkDay[];
  timeZone: string;
  onEntryPress: (entry: TimeEntryResponseDto) => void;
  onAddPress: () => void;
}

/** Los totales del mes y, debajo, cada día con sus fichajes; vacío con la acción de añadir. */
export function MonthContent({
  month,
  days,
  timeZone,
  onEntryPress,
  onAddPress,
}: Readonly<MonthContentProps>): React.JSX.Element {
  return (
    <>
      <MonthTotals
        workedMinutes={month.totals.workedMinutes}
        daysWorked={month.totals.daysWorked}
        editedCount={month.totals.editedCount}
      />
      {days.length === 0 ? (
        <EmptyState
          iconName="clock"
          title={i18n.t('timeClock.emptyTitle')}
          description={i18n.t('timeClock.emptyDescription')}
          actionLabel={i18n.t('timeClock.addAction')}
          onActionPress={onAddPress}
        />
      ) : null}
      {days.map((day) => (
        <WorkDayCard
          key={day.workDate}
          day={day}
          dayLabel={formatShortDate(`${day.workDate}T12:00:00.000Z`, timeZone)}
          timeZone={timeZone}
          onEntryPress={onEntryPress}
        />
      ))}
    </>
  );
}
