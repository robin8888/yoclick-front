import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';

import { resolveSessionPhase } from '../model/session-phase';
import { ClassSessionSummary } from './ClassSessionSummary';
import { ClassTimerPanel } from './ClassTimerPanel';

interface ClassSessionBodyProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  timeZone: string;
}

/** El reloj (solo mientras la clase está en curso) y el resumen de previsto frente a real. */
export function ClassSessionBody({
  booking,
  timeZone,
}: Readonly<ClassSessionBodyProps>): React.JSX.Element {
  const isInProgress = resolveSessionPhase(booking) === 'in-progress';

  return (
    <>
      {isInProgress && booking.startedAt !== null ? (
        <ClassTimerPanel
          startedAt={booking.startedAt}
          plannedDurationMinutes={booking.service.durationMinutes}
        />
      ) : null}
      <ClassSessionSummary booking={booking} timeZone={timeZone} />
    </>
  );
}
