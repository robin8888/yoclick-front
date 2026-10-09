import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';
import { useTickingNow } from '../hooks/useTickingNow';
import { canCancelAppointment } from '../model/session-phase';
import { AppointmentChangeActions } from './AppointmentChangeActions';
import { ClassProgressControls } from './ClassProgressControls';

interface ClassSessionFooterProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  /** El día de la agenda desde el que se abrió la cita. */
  isoDate: string;
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
 * Los botones de la clase y los de cambiar la hora o cancelar la cita. La ventana de inicio se
 * vuelve a calcular cada segundo para que el botón se active solo al llegar la hora.
 */
export function ClassSessionFooter({
  booking,
  isoDate,
  clientName,
  isStarting,
  isEnding,
  isCancelling,
  onStart,
  onEnd,
  onCancel,
}: Readonly<ClassSessionFooterProps>): React.JSX.Element {
  const now = useTickingNow();

  return (
    <>
      <ClassProgressControls
        booking={booking}
        now={now}
        isStarting={isStarting}
        isEnding={isEnding}
        onStart={onStart}
        onEnd={onEnd}
      />
      {canCancelAppointment(booking, now) ? (
        <AppointmentChangeActions
          booking={booking}
          isoDate={isoDate}
          clientName={clientName}
          isCancelling={isCancelling}
          onCancel={onCancel}
        />
      ) : null}
    </>
  );
}
