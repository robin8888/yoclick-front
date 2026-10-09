import { useRouter } from 'expo-router';

import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface RescheduleAppointmentButtonProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  /** El día de la agenda desde el que se abrió la cita. */
  isoDate: string;
}

/** «Cambiar hora»: abre la búsqueda de un hueco libre de la misma persona. */
export function RescheduleAppointmentButton({
  booking,
  isoDate,
}: Readonly<RescheduleAppointmentButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      isFullWidth
      label={i18n.t('staffAgenda.session.rescheduleAction')}
      onPress={() => {
        router.push({
          pathname: '/(staff)/reschedule-appointment',
          params: {
            bookingId: booking.id,
            serviceId: booking.service.id,
            staffMembershipId: booking.staff.membershipId,
            date: isoDate,
          },
        });
      }}
    />
  );
}
