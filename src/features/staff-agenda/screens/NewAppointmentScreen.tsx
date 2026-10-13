import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { JoinSessionFields } from '../components/JoinSessionFields';
import { NewAppointmentFields } from '../components/NewAppointmentFields';
import { useBookClients } from '../hooks/useBookClients';
import {
  toggleChosenClient,
  useNewAppointmentForm,
  type ChosenClient,
  type NewAppointmentForm,
} from '../hooks/useNewAppointmentForm';
import { useRoomAgenda } from '../hooks/useRoomAgenda';
import { buildBookingPlan, type BookingPlan } from '../model/booking-plan';
import { newAppointmentRouteParamsSchema } from '../model/new-appointment-route-params';
import { canJoinSession, findSessionInRoomAgenda } from '../model/room-agenda';

/** Lo que se envía al guardar: apuntar a un grupo que ya existe o crear la cita, para 1 o varias personas. */
function useAppointmentSubmission(form: NewAppointmentForm, onDone: () => void) {
  const booking = useBookClients(form.clients);
  const plan = buildBookingPlan({
    clientMembershipIds: form.clients.map((client) => client.membershipId),
    staffMembershipId: form.staffMembershipId,
    serviceId: form.serviceId,
    startsAt: form.selectedStartsAt,
    mode: form.mode,
    roomId: form.roomId,
    joinSessionId: form.joinSessionId,
  });

  return {
    isLoading: booking.isBooking,
    errorMessage: booking.errorMessage,
    clearError: booking.clearError,
    canSave: plan !== null,
    save: () => {
      if (plan !== null) booking.bookClients(plan, onDone);
    },
  };
}

interface AppointmentScreenFrameProps {
  title: string;
  saveLabel: string;
  canSave: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onErrorDismiss: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

function AppointmentScreenFrame({
  title,
  saveLabel,
  canSave,
  isLoading,
  errorMessage,
  onErrorDismiss,
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
      <ProblemModal message={errorMessage} onDismiss={onErrorDismiss} {...getProblemModalCopy()} />
    </ScreenTemplate>
  );
}

/** Apuntar a varias personas a una clase que ya existe: no hay nada más que decidir. */
function buildJoinPlan(
  clients: readonly ChosenClient[],
  joinSessionId: string | null,
): BookingPlan | null {
  return buildBookingPlan({
    clientMembershipIds: clients.map((client) => client.membershipId),
    staffMembershipId: null,
    serviceId: null,
    startsAt: null,
    mode: 'group',
    roomId: null,
    joinSessionId,
  });
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
  const [clients, setClients] = useState<ChosenClient[]>([]);
  const booking = useBookClients(clients);
  const found =
    agenda.data === undefined ? undefined : findSessionInRoomAgenda(agenda.data, sessionId);
  const joinableSessionId =
    found !== undefined && canJoinSession(found.session, new Date()) ? sessionId : null;
  const plan = buildJoinPlan(clients, joinableSessionId);

  return (
    <AppointmentScreenFrame
      title={i18n.t('staffAgenda.newAppointment.joinSessionTitle')}
      saveLabel={i18n.t('staffAgenda.newAppointment.joinSaveAction')}
      canSave={plan !== null}
      isLoading={booking.isBooking}
      errorMessage={booking.errorMessage}
      onErrorDismiss={booking.clearError}
      onSave={() => {
        if (plan !== null) booking.bookClients(plan, router.back);
      }}
    >
      <JoinSessionFields
        agenda={agenda}
        found={found}
        clients={clients}
        onClientToggle={(chosen) => {
          setClients((current) => toggleChosenClient(current, chosen, true));
        }}
        onClientsClear={() => {
          setClients([]);
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
      onErrorDismiss={submission.clearError}
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
