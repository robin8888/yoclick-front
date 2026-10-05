import { useState } from 'react';

import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';

import { useTickingNow } from '../hooks/useTickingNow';
import { isWithinStartWindow, resolveSessionPhase } from '../model/session-phase';
import { ClassSessionActions } from './ClassSessionActions';
import { EndClassSheet } from './EndClassSheet';

interface ClassSessionFooterProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  isStarting: boolean;
  isEnding: boolean;
  onStart: () => void;
  /** Termina la clase en el servidor y avisa cuando ya está cerrada. */
  onEnd: (onEnded: () => void) => void;
}

/**
 * Los botones de la clase y la hoja de «¿Terminar la clase?». La ventana de inicio se vuelve a
 * calcular cada segundo para que el botón se active solo al llegar la hora.
 */
export function ClassSessionFooter({
  booking,
  isStarting,
  isEnding,
  onStart,
  onEnd,
}: Readonly<ClassSessionFooterProps>): React.JSX.Element {
  const now = useTickingNow();
  const [isEndSheetVisible, setIsEndSheetVisible] = useState(false);

  return (
    <>
      <ClassSessionActions
        phase={resolveSessionPhase(booking)}
        canStartNow={isWithinStartWindow({
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          now,
        })}
        isStartWindowPast={now.getTime() > new Date(booking.endsAt).getTime()}
        isStarting={isStarting}
        onStart={onStart}
        onEndRequest={() => {
          setIsEndSheetVisible(true);
        }}
      />
      <EndClassSheet
        isVisible={isEndSheetVisible}
        isEnding={isEnding}
        onConfirm={() => {
          onEnd(() => {
            setIsEndSheetVisible(false);
          });
        }}
        onDismiss={() => {
          setIsEndSheetVisible(false);
        }}
      />
    </>
  );
}
