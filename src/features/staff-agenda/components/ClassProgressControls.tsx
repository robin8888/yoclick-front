import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';

import { useVisibility } from '../hooks/useVisibility';
import { isWithinStartWindow, resolveSessionPhase } from '../model/session-phase';
import { ClassSessionActions } from './ClassSessionActions';
import { EndClassSheet } from './EndClassSheet';

interface ClassProgressControlsProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  /** El instante actual, que se actualiza cada segundo para activar el botón al llegar la hora. */
  now: Date;
  isStarting: boolean;
  isEnding: boolean;
  onStart: () => void;
  /** Termina la clase en el servidor y avisa cuando ya está cerrada. */
  onEnd: (onEnded: () => void) => void;
}

/** Iniciar la clase y, ya en curso, terminarla con su confirmación «¿Terminar la clase?». */
export function ClassProgressControls({
  booking,
  now,
  isStarting,
  isEnding,
  onStart,
  onEnd,
}: Readonly<ClassProgressControlsProps>): React.JSX.Element {
  const endSheet = useVisibility();

  return (
    <>
      <ClassSessionActions
        phase={resolveSessionPhase(booking)}
        canStartNow={isWithinStartWindow({ ...booking, now })}
        isStartWindowPast={now.getTime() > new Date(booking.endsAt).getTime()}
        isStarting={isStarting}
        onStart={onStart}
        onEndRequest={endSheet.show}
      />
      <EndClassSheet
        isVisible={endSheet.isVisible}
        isEnding={isEnding}
        onConfirm={() => {
          onEnd(endSheet.hide);
        }}
        onDismiss={endSheet.hide}
      />
    </>
  );
}
