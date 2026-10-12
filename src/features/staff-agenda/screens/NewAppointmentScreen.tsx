import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { JoinSessionFields } from '../components/JoinSessionFields';
import { NewAppointmentFields } from '../components/NewAppointmentFields';
import { useCreateAgendaBooking } from '../hooks/useCreateAgendaBooking';
import {
  useNewAppointmentForm,
  type ChosenClient,
  type NewAppointmentForm,
} from '../hooks/useNewAppointmentForm';
import { useRoomAgenda } from '../hooks/useRoomAgenda';
import {
  buildJoinGroupRequest,
  buildNewAppointmentRequest,
} from '../model/new-appointment-request';
import { newAppointmentRouteParamsSchema } from '../model/new-appointment-route-params';
import { canJoinSession, findSessionInRoomAgenda } from '../model/room-agenda';

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

interface AppointmentScreenFrameProps {
  title: string;
  saveLabel: string;
  canSave: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onSave: () => void;
  children: React.ReactNode;
}

function AppointmentScreenFrame({
  title,
  saveLabel,
  canSave,
  isLoading,
  errorMessage,
  onSave,
  children,
}: Readonly<AppointmentScreenFrameProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={title}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={isLoading}
      footer={<Button label={saveLabel} isFullWidth isDisabled={!canSave} onPress={onSave} />}
    >
      {children}
      {errorMessage === null ? null : (
        <Text color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </ScreenTemplate>
  );
}

/**
 * «Apuntar a la clase»: la sesión viene de la agenda por salas, así que servicio, profesor, sala,
 * hora y modo ya están decididos; solo se elige a la persona.
 */
function JoinSessionContent({
  isoDate,
  sessionId,
}: Readonly<{ isoDate: string; sessionId: string }>): React.JSX.Element {
  const router = useRouter();
  const agenda = useRoomAgenda(isoDate);
  const creation = useCreateAgendaBooking();
  const [client, setClient] = useState<ChosenClient | null>(null);
  const found =
    agenda.data === undefined ? undefined : findSessionInRoomAgenda(agenda.data, sessionId);
  const joinRequest = buildJoinGroupRequest({
    clientMembershipId: client?.membershipId ?? null,
    joinSessionId: found !== undefined && canJoinSession(found.session) ? sessionId : null,
  });

  return (
    <AppointmentScreenFrame
      title={i18n.t('staffAgenda.newAppointment.joinSessionTitle')}
      saveLabel={i18n.t('staffAgenda.newAppointment.joinSaveAction')}
      canSave={joinRequest !== null}
      isLoading={creation.isCreating}
      errorMessage={creation.createErrorMessage}
      onSave={() => {
        if (joinRequest !== null) creation.joinGroup(joinRequest, router.back);
      }}
    >
      <JoinSessionFields
        agenda={agenda}
        found={found}
        client={client}
        onClientSelect={setClient}
        onClientClear={() => {
          setClient(null);
        }}
      />
    </AppointmentScreenFrame>
  );
}

/**
 * «Nueva cita» del centro: cliente, profesional, servicio y una hora libre de ese profesional; en
 * centros con salas, privada o grupal y la sala (o apuntarse a un grupo con plazas).
 */
function NewAppointmentContent({
  isoDate,
  presetTime,
}: Readonly<{ isoDate: string; presetTime: string | undefined }>): React.JSX.Element {
  const router = useRouter();
  const form = useNewAppointmentForm({ isoDate, presetTime });
  const submission = useAppointmentSubmission(form, router.back);

  return (
    <AppointmentScreenFrame
      title={i18n.t('staffAgenda.newAppointment.title')}
      saveLabel={i18n.t('staffAgenda.newAppointment.saveAction')}
      canSave={submission.canSave}
      isLoading={submission.isLoading}
      errorMessage={submission.errorMessage}
      onSave={submission.save}
    >
      <NewAppointmentFields form={form} />
    </AppointmentScreenFrame>
  );
}

/** Con `sessionId` en la ruta se apunta a una clase que ya existe; si no, se crea una cita. */
export function NewAppointmentScreen(): React.JSX.Element {
  const params = newAppointmentRouteParamsSchema.safeParse(useLocalSearchParams());
  const sessionId = params.success ? params.data.sessionId : undefined;

  if (params.success && sessionId !== undefined) {
    return <JoinSessionContent isoDate={params.data.date} sessionId={sessionId} />;
  }
  return (
    <NewAppointmentContent
      isoDate={params.success ? params.data.date : ''}
      presetTime={params.success ? params.data.time : undefined}
    />
  );
}
