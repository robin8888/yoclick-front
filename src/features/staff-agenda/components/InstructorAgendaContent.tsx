import { useRouter } from 'expo-router';

import { useTickingNow } from '@/shared/hooks/useTickingNow';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { getTodayIsoDate } from '@/shared/lib/format/iso-date';

import { buildDayTimeline, describeOpeningRanges } from '../model/day-timeline';
import { buildIosDayLayout, readNowMinutes } from '../model/ios-day-layout';
import { AvailabilityCard } from './AvailabilityCard';
import { DayTotalsRow } from './DayTotalsRow';
import { IosDayTimeline } from './IosDayTimeline';

/** Con refrescar cada minuto la línea de «ahora» se mueve sin gastar batería. */
const NOW_REFRESH_MS = 60_000;

/** Disponibilidad, cifras del día y la agenda del profesional como el calendario de iOS. */
export function InstructorAgendaContent({
  agenda,
}: Readonly<{ agenda: AgendaResponseDto }>): React.JSX.Element {
  const router = useRouter();
  const now = useTickingNow(NOW_REFRESH_MS);
  const totals = buildDayTimeline({
    openingRanges: agenda.openingRanges,
    entries: agenda.entries,
    timeZone: agenda.timezone,
  }).totals;
  const layout = buildIosDayLayout({
    entries: agenda.entries,
    openingRanges: agenda.openingRanges,
    timeZone: agenda.timezone,
  });
  const isToday = getTodayIsoDate(now, agenda.timezone) === agenda.date;

  return (
    <>
      <AvailabilityCard openingLabel={describeOpeningRanges(agenda.openingRanges)} />
      <DayTotalsRow totals={totals} />
      <IosDayTimeline
        layout={layout}
        nowMinutes={isToday ? readNowMinutes(now, agenda.timezone) : null}
        onEventPress={(bookingId) => {
          router.push({
            pathname: '/(staff)/sessions/[bookingId]',
            params: { bookingId, date: agenda.date },
          });
        }}
      />
    </>
  );
}
