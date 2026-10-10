import { useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { NewAppointmentFields } from '../components/NewAppointmentFields';
import { useCreateAgendaBooking } from '../hooks/useCreateAgendaBooking';
import { useNewAppointmentForm, type NewAppointmentForm } from '../hooks/useNewAppointmentForm';
import {
  buildJoinGroupRequest,
  buildNewAppointmentRequest,
} from '../model/new-appointment-request';
import { newAppointmentRouteParamsSchema } from '../model/new-appointment-route-params';

/** Lo que se envía al guardar: apuntar a un grupo que ya existe o crear la cita. */
function useAppointmentSubmission(form: NewAppointmentForm, onDone: () => void) {
  const creation = useCreateAgendaBooking();
  const clientMembershipId = form.client?.membershipId ?? null;
  const request = buildNewAppointmentRequest({
    clientMembershipId,
    staffMembershipId: form.staffMembershipId,
    serviceId: form.serviceId,
    startsAt: form.selectedStartsAt,
    mode: form.mode,
    roomId: form.roomId,
  });
  const joinRequest = buildJoinGroupRequest({
    clientMembershipId,
    joinSessionId: form.joinSessionId,
  });

  return {
    isLoading: creation.isCreating,
    errorMessage: creation.createErrorMessage,
    canSave: joinRequest !== null || request !== null,
    save: () => {
      if (joinRequest !== null) creation.joinGroup(joinRequest, onDone);
      else if (request !== null) creation.createBooking(request, onDone);
    },
  };
}

/**
 * «Nueva cita» del centro: cliente, profesional, servicio y una hora libre de ese profesional; en
 * centros con salas, privada o grupal y la sala (o apuntarse a un grupo con plazas).
 */
export function NewAppointmentScreen(): React.JSX.Element {
  const router = useRouter();
  const params = newAppointmentRouteParamsSchema.safeParse(useLocalSearchParams());
  const form = useNewAppointmentForm({
    isoDate: params.success ? params.data.date : '',
    presetTime: params.success ? params.data.time : undefined,
  });
  const submission = useAppointmentSubmission(form, router.back);

  return (
    <ScreenTemplate
      title={i18n.t('staffAgenda.newAppointment.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={submission.isLoading}
      footer={
        <Button
          label={i18n.t('staffAgenda.newAppointment.saveAction')}
          isFullWidth
          isDisabled={!submission.canSave}
          onPress={submission.save}
        />
      }
    >
      <NewAppointmentFields form={form} />
      {submission.errorMessage === null ? null : (
        <Text color="danger" role="alert">
          {submission.errorMessage}
        </Text>
      )}
    </ScreenTemplate>
  );
}
