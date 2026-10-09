import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RescheduleSlotPicker } from '../components/RescheduleSlotPicker';
import { useRescheduleAgendaBooking } from '../hooks/useRescheduleAgendaBooking';
import { useRescheduleDaySlots } from '../hooks/useRescheduleDaySlots';
import { rescheduleAppointmentRouteParamsSchema } from '../model/reschedule-appointment-route-params';

/** Pantallas que se cierran al terminar: esta y el detalle de la cita, que ya no es la misma. */
const SCREENS_TO_CLOSE = 2;

interface RescheduleAppointmentFormProps {
  bookingId: string;
  serviceId: string;
  staffMembershipId: string;
  initialIsoDate: string;
}

function RescheduleAppointmentForm({
  bookingId,
  serviceId,
  staffMembershipId,
  initialIsoDate,
}: Readonly<RescheduleAppointmentFormProps>): React.JSX.Element {
  const router = useRouter();
  const day = useRescheduleDaySlots({ serviceId, staffMembershipId, initialIsoDate });
  const reschedule = useRescheduleAgendaBooking(bookingId);
  const { selectedStartsAt } = day;

  function handleConfirm(): void {
    if (selectedStartsAt === null) return;
    reschedule.rescheduleBooking({ startsAt: selectedStartsAt, staffMembershipId }, () => {
      router.dismiss(SCREENS_TO_CLOSE);
    });
  }

  return (
    <ScreenTemplate
      title={i18n.t('staffAgenda.reschedule.title')}
      subtitle={i18n.t('staffAgenda.reschedule.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={reschedule.isRescheduling}
      footer={
        <Button
          label={i18n.t('staffAgenda.reschedule.confirmAction')}
          isFullWidth
          isDisabled={selectedStartsAt === null}
          onPress={handleConfirm}
        />
      }
    >
      <RescheduleSlotPicker day={day} />
      {reschedule.rescheduleErrorMessage === null ? null : (
        <FormErrorBanner message={reschedule.rescheduleErrorMessage} />
      )}
    </ScreenTemplate>
  );
}

/** Mover la cita de un cliente a otro hueco libre de la misma persona; el cliente recibe un aviso. */
export function RescheduleAppointmentScreen(): React.JSX.Element {
  const params = rescheduleAppointmentRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return (
    <RescheduleAppointmentForm
      bookingId={params.data.bookingId}
      serviceId={params.data.serviceId}
      staffMembershipId={params.data.staffMembershipId}
      initialIsoDate={params.data.date}
    />
  );
}
