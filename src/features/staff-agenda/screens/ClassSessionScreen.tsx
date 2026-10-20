import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useActiveCenterModules } from '@/features/join';
import { SessionWaitlistPanel } from '@/features/waitlist';
import { ClassSessionBody } from '../components/ClassSessionBody';
import { SessionAttendanceSection } from '../components/SessionAttendanceSection';
import { listSessionAttendees, type SessionAttendee } from '../model/attendance';
import { ClassSessionFooter } from '../components/ClassSessionFooter';
import { useClassSessionActions } from '../hooks/useClassSessionActions';
import { useDayAgenda } from '../hooks/useDayAgenda';
import { classSessionRouteParamsSchema } from '../model/session-route-params';

interface ClassSessionDetailProps {
  entry: AgendaResponseDtoEntriesItem;
  /** Todas las citas del día, para listar a las personas de la misma clase. */
  dayEntries: readonly AgendaResponseDtoEntriesItem[];
  timeZone: string;
  isoDate: string;
  canAddPeople: boolean;
}

/** «Una persona» o «N personas»: lo que dice el subtítulo de la clase. */
function describeSessionPeople(
  attendees: readonly SessionAttendee[],
  fallbackName: string,
): string {
  if (attendees.length <= 1) return fallbackName;
  return i18n.t('staffAgenda.attendance.peopleCount', { count: attendees.length });
}

interface ClassSessionMainProps {
  booking: AgendaResponseDtoEntriesItem['booking'];
  attendees: readonly SessionAttendee[];
  timeZone: string;
  isoDate: string;
  canAddPeople: boolean;
}

/** La asistencia (check por persona y QR) y, debajo, el reloj y el resumen de la clase. */
function ClassSessionMain({
  booking,
  attendees,
  timeZone,
  isoDate,
  canAddPeople,
}: Readonly<ClassSessionMainProps>): React.JSX.Element {
  const modules = useActiveCenterModules();
  const hasAttendance =
    modules.attendance && booking.status !== 'cancelled' && attendees.length > 0;

  return (
    <>
      {hasAttendance ? (
        <SessionAttendanceSection
          attendees={attendees}
          startsAt={booking.startsAt}
          isCenterWide={canAddPeople}
        />
      ) : null}
      <ClassSessionBody {...{ booking, timeZone, isoDate, canAddPeople }} />
      {modules.waitlist && booking.session.mode === 'group' && booking.status !== 'cancelled' ? (
        <SessionWaitlistPanel classSessionId={booking.session.id} timeZone={timeZone} />
      ) : null}
    </>
  );
}

function ClassSessionDetail({
  entry,
  dayEntries,
  timeZone,
  isoDate,
  canAddPeople,
}: Readonly<ClassSessionDetailProps>): React.JSX.Element {
  const router = useRouter();
  const { booking, client } = entry;
  const actions = useClassSessionActions(booking.id, isoDate);
  const attendees = listSessionAttendees(dayEntries, booking.session.id);

  return (
    <ScreenTemplate
      title={booking.service.name}
      subtitle={describeSessionPeople(attendees, client.fullName)}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={actions.isStarting || actions.isEnding || actions.isCancelling}
      footer={
        <ClassSessionFooter
          booking={booking}
          isoDate={isoDate}
          isStarting={actions.isStarting}
          isEnding={actions.isEnding}
          clientName={client.fullName}
          canReschedule={canAddPeople}
          isCancelling={actions.isCancelling}
          onStart={actions.startClass}
          onEnd={actions.endClass}
          onCancel={actions.cancelBooking}
        />
      }
    >
      {actions.actionErrorMessage === null ? null : (
        <FormErrorBanner message={actions.actionErrorMessage} />
      )}
      <ClassSessionMain {...{ booking, attendees, timeZone, isoDate, canAddPeople }} />
    </ScreenTemplate>
  );
}

function SessionNotFound({ onBack }: Readonly<{ onBack: () => void }>): React.JSX.Element {
  return (
    <ScreenTemplate title={i18n.t('staffAgenda.session.title')}>
      <EmptyState
        iconName="calendar"
        title={i18n.t('staffAgenda.session.notFoundTitle')}
        description={i18n.t('staffAgenda.session.notFoundDescription')}
        actionLabel={i18n.t('staffAgenda.session.backToAgendaAction')}
        onActionPress={onBack}
      />
    </ScreenTemplate>
  );
}

interface ClassSessionContentProps {
  bookingId: string;
  isoDate: string;
  canAddPeople: boolean;
}

function ClassSessionContent({
  bookingId,
  isoDate,
  canAddPeople,
}: Readonly<ClassSessionContentProps>): React.JSX.Element {
  const router = useRouter();
  const agenda = useDayAgenda(isoDate);
  const entry = agenda.data?.entries.find((candidate) => candidate.booking.id === bookingId);

  if (agenda.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (entry === undefined || agenda.data === undefined) {
    return <SessionNotFound onBack={router.back} />;
  }
  return (
    <ClassSessionDetail
      entry={entry}
      dayEntries={agenda.data.entries}
      timeZone={agenda.data.timezone}
      isoDate={isoDate}
      canAddPeople={canAddPeople}
    />
  );
}

/** Iniciar y terminar una clase con temporizador; queda registrado para el propietario. */
export function ClassSessionScreen(): React.JSX.Element {
  const params = classSessionRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return (
    <ClassSessionContent
      bookingId={params.data.bookingId}
      isoDate={params.data.date}
      canAddPeople={params.data.isCenterWide === 'true'}
    />
  );
}
