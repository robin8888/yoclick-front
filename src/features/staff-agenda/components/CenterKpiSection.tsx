import { formatLongDate } from '@/features/booking';
import type { AgendaResponseDto } from '@/shared/api/generated/model';

import { useDaySummary } from '../hooks/useDaySummary';
import { useScheduledDifference } from '../hooks/useScheduledDifference';
import { countCancelledEntries, countScheduledEntries } from '../model/center-agenda-summary';
import { CenterKpiGrid } from './CenterKpiGrid';

interface CenterKpiSectionProps {
  agenda: AgendaResponseDto;
}

/** Las cuatro tarjetas de resumen del día: las dos de las citas y las dos que calcula el servidor. */
export function CenterKpiSection({ agenda }: Readonly<CenterKpiSectionProps>): React.JSX.Element {
  const scheduledCount = countScheduledEntries(agenda.entries);
  const scheduledDifference = useScheduledDifference(agenda.date, scheduledCount);
  const summary = useDaySummary(agenda.date);
  const weekdayName = formatLongDate(`${agenda.date}T12:00:00.000Z`, 'UTC').split(',')[0] ?? '';

  return (
    <CenterKpiGrid
      scheduledCount={scheduledCount}
      cancelledCount={countCancelledEntries(agenda.entries)}
      scheduledDifference={scheduledDifference}
      weekdayName={weekdayName}
      summary={summary.data}
    />
  );
}
