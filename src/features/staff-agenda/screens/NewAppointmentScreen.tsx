import { useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { NewAppointmentFields } from '../components/NewAppointmentFields';
import { useCreateAgendaBooking } from '../hooks/useCreateAgendaBooking';
import { useNewAppointmentForm } from '../hooks/useNewAppointmentForm';
import { newAppointmentRouteParamsSchema } from '../model/new-appointment-route-params';

/** Prototipo `iagenda` › «Nueva cita»: cliente, servicio y una hora libre de tu agenda. */
export function NewAppointmentScreen(): React.JSX.Element {
  const router = useRouter();
  const params = newAppointmentRouteParamsSchema.safeParse(useLocalSearchParams());
  const form = useNewAppointmentForm({
    isoDate: params.success ? params.data.date : '',
    presetTime: params.success ? params.data.time : undefined,
  });
  const creation = useCreateAgendaBooking();
  const { client, serviceId, selectedStartsAt } = form;

  function handleSave(): void {
    if (client === null || serviceId === null || selectedStartsAt === null) return;
    creation.createBooking(
      { clientMembershipId: client.membershipId, serviceId, startsAt: selectedStartsAt },
      router.back,
    );
  }

  return (
    <ScreenTemplate
      title={i18n.t('staffAgenda.newAppointment.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={creation.isCreating}
      footer={
        <Button
          label={i18n.t('staffAgenda.newAppointment.saveAction')}
          isFullWidth
          isDisabled={client === null || serviceId === null || selectedStartsAt === null}
          onPress={handleSave}
        />
      }
    >
      <NewAppointmentFields form={form} />
      {creation.createErrorMessage === null ? null : (
        <Text color="danger" role="alert">
          {creation.createErrorMessage}
        </Text>
      )}
    </ScreenTemplate>
  );
}
