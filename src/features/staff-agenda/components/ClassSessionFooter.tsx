import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';
import { useTickingNow } from '../hooks/useTickingNow';
import { useVisibility } from '../hooks/useVisibility';
import {
  canCancelAppointment,
  isWithinStartWindow,
  resolveSessionPhase,
} from '../model/session-phase';
import { CancelAppointmentControl } from './CancelAppointmentControl';
import { ClassSessionActions } from './ClassSessionActions';
import { EndClassSheet } from './EndClassSheet';

interface ClassSessionFooterProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  clientName: string;
  isStarting: boolean;
  isEnding: boolean;
  isCancelling: boolean;
  onStart: () => void;
  /** Termina la clase en el servidor y avisa cuando ya está cerrada. */
  onEnd: (onEnded: () => void) => void;
  /** Cancela la cita en el servidor (el cliente recibe un aviso) y avisa cuando ya está cancelada. */
  onCancel: (onCancelled: () => void) => void;
}

/**
 * Los botones de la clase y las hojas de «¿Terminar la clase?» y «¿Cancelar esta cita?». La ventana
 * de inicio se vuelve a calcular cada segundo para que el botón se active solo al llegar la hora.
 */
export function ClassSessionFooter({
  booking,
  clientName,
  isStarting,
  isEnding,
  isCancelling,
  onStart,
  onEnd,
  onCancel,
}: Readonly<ClassSessionFooterProps>): React.JSX.Element {
  const now = useTickingNow();
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
      {canCancelAppointment(booking, now) ? (
        <CancelAppointmentControl
          clientName={clientName}
          isCancelling={isCancelling}
          onCancel={onCancel}
        />
      ) : null}
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
