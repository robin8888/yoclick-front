import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';

import { CancelAppointmentControl } from './CancelAppointmentControl';
import { RescheduleAppointmentButton } from './RescheduleAppointmentButton';

interface AppointmentChangeActionsProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  /** El día de la agenda desde el que se abrió la cita. */
  isoDate: string;
  clientName: string;
  /** Mover la cita es cosa del centro; el profesional solo puede cancelarla. */
  canReschedule: boolean;
  isCancelling: boolean;
  /** Cancela la cita en el servidor (el cliente recibe un aviso) y avisa cuando ya está cancelada. */
  onCancel: (onCancelled: () => void) => void;
}

/** Lo que se puede hacer con una cita que aún no ha empezado: cancelarla y, el centro, cambiar su hora. */
export function AppointmentChangeActions({
  booking,
  isoDate,
  clientName,
  canReschedule,
  isCancelling,
  onCancel,
}: Readonly<AppointmentChangeActionsProps>): React.JSX.Element {
  return (
    <>
      {canReschedule && booking.session.mode === 'private' ? (
        <RescheduleAppointmentButton booking={booking} isoDate={isoDate} />
      ) : null}
      <CancelAppointmentControl
        clientName={clientName}
        isCancelling={isCancelling}
        onCancel={onCancel}
      />
    </>
  );
}
