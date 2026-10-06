import { useRouter } from 'expo-router';

import type { AgendaResponseDto } from '@/shared/api/generated/model';

import { buildDayTimeline, describeOpeningRanges } from '../model/day-timeline';
import { AvailabilityCard } from './AvailabilityCard';
import { DayTimeline } from './DayTimeline';
import { DayTotalsRow } from './DayTotalsRow';

/** Disponibilidad, cifras del día y rejilla de horas de la agenda del profesional. */
export function InstructorAgendaContent({
  agenda,
}: Readonly<{ agenda: AgendaResponseDto }>): React.JSX.Element {
  const router = useRouter();
  const timeline = buildDayTimeline({
    openingRanges: agenda.openingRanges,
    entries: agenda.entries,
    timeZone: agenda.timezone,
  });

  return (
    <>
      <AvailabilityCard openingLabel={describeOpeningRanges(agenda.openingRanges)} />
      <DayTotalsRow totals={timeline.totals} />
      <DayTimeline
        rows={timeline.rows}
        timeZone={agenda.timezone}
        onEntryPress={(bookingId) => {
          router.push({
            pathname: '/(staff)/sessions/[bookingId]',
            params: { bookingId, date: agenda.date },
          });
        }}
        onFreeSlotPress={(hourLabel) => {
          router.push({
            pathname: '/(staff)/new-appointment',
            params: { date: agenda.date, time: hourLabel },
          });
        }}
      />
    </>
  );
}
