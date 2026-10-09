import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';

import { CancelAppointmentControl } from './CancelAppointmentControl';
import { RescheduleAppointmentButton } from './RescheduleAppointmentButton';

interface AppointmentChangeActionsProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  /** El día de la agenda desde el que se abrió la cita. */
  isoDate: string;
  clientName: string;
  isCancelling: boolean;
  /** Cancela la cita en el servidor (el cliente recibe un aviso) y avisa cuando ya está cancelada. */
  onCancel: (onCancelled: () => void) => void;
}

/** Lo que se puede hacer con una cita que aún no ha empezado: cambiar su hora o cancelarla. */
export function AppointmentChangeActions({
  booking,
  isoDate,
  clientName,
  isCancelling,
  onCancel,
}: Readonly<AppointmentChangeActionsProps>): React.JSX.Element {
  return (
    <>
      <RescheduleAppointmentButton booking={booking} isoDate={isoDate} />
      <CancelAppointmentControl
        clientName={clientName}
        isCancelling={isCancelling}
        onCancel={onCancel}
      />
    </>
  );
}
