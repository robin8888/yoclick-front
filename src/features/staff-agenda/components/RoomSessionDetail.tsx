import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { buildFinishedLook, useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { canJoinSession, hasSessionEnded, type RoomSession } from '../model/room-agenda';
import { describeTeacherLine } from '../model/teacher-line';
import { createEntryCardStyle } from './AgendaEntryCard.styles';
import { AttendeeRow } from './AttendeeRow';
import { CancelSessionDayControl } from './CancelSessionDayControl';

interface RoomSessionDetailProps {
  session: RoomSession;
  timeZone: string;
  isoDate: string;
  now: Date;
}

interface AttendeeListProps {
  session: RoomSession;
  isFinished: boolean;
}

function AttendeeList({ session, isFinished }: Readonly<AttendeeListProps>): React.JSX.Element {
  const router = useRouter();
  const { tint } = buildFinishedLook(isFinished);

  return (
    <>
      <Text variant="bodyStrong" {...tint}>
        {i18n.t('staffAgenda.rooms.attendeesTitle')}
      </Text>
      {session.attendees.length === 0 ? (
        <Text color="ink2" {...tint}>
          {i18n.t('staffAgenda.rooms.noAttendees')}
        </Text>
      ) : null}
      {session.attendees.map((attendee) => (
        <AttendeeRow
          key={attendee.bookingId}
          fullName={attendee.fullName}
          photoUrl={attendee.photoUrl}
          isEnrollment={attendee.source === 'enrollment'}
          tintColor={tint.tintColor}
          onPress={() => {
            router.push({
              pathname: '/(admin)/clients/[membershipId]',
              params: { membershipId: attendee.clientMembershipId },
            });
          }}
        />
      ))}
    </>
  );
}

/** Apuntar a más alumnos a esta clase: la cita ya está decidida, solo se elige a la persona. */
function AddPeopleButton({
  isoDate,
  sessionId,
}: Readonly<{ isoDate: string; sessionId: string }>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      isFullWidth
      label={i18n.t('staffAgenda.session.addPeopleAction')}
      onPress={() => {
        router.push({
          pathname: '/(admin)/new-appointment',
          params: { date: isoDate, sessionId },
        });
      }}
    />
  );
}

/** «Horario fijo», «Cancelada: motivo» o «Terminada»: el estado con palabra, no solo con color. */
function SessionStateLines({
  session,
  isFinished,
  isMuted,
}: Readonly<{
  session: RoomSession;
  isFinished: boolean;
  /** Terminada o cancelada: va en gris con texto blanco. */
  isMuted: boolean;
}>): React.JSX.Element {
  const { tint } = buildFinishedLook(isMuted);

  return (
    <>
      {session.schedule === null ? null : (
        <Text variant="caption" color="info" {...tint}>
          {session.schedule.label ?? i18n.t('staffAgenda.rooms.scheduleSession')}
        </Text>
      )}
      {session.cancelledReason === null ? null : (
        <Text color="danger" role="alert" {...tint}>
          {i18n.t('staffAgenda.rooms.cancelledSession', { reason: session.cancelledReason })}
        </Text>
      )}
      {isFinished ? (
        <Text variant="bodyStrong" color="ink2" {...tint}>
          {i18n.t('staffAgenda.rooms.finishedSession')}
        </Text>
      ) : null}
    </>
  );
}

/** Una clase de la sala: horas, servicio, profesor, aforo, alumnos y «Cancelar este día». */
export function RoomSessionDetail({
  session,
  timeZone,
  isoDate,
  now,
}: Readonly<RoomSessionDetailProps>): React.JSX.Element {
  const theme = useTheme();
  const isCancelled = session.cancelledReason !== null;
  const isFinished = !isCancelled && hasSessionEnded(session, now);
  // Las clases canceladas y las terminadas se ven igual de apagadas: gris con texto blanco.
  const isMuted = isCancelled || isFinished;
  const { tint, cardStyle } = buildFinishedLook(isMuted);

  return (
    <View style={[createEntryCardStyle(theme), cardStyle]}>
      <Text variant="titleMd" color="brandInk" {...tint}>
        {i18n.t('staffAgenda.agenda.timeRange', {
          startTime: formatTime24h(session.startsAt, timeZone),
          endTime: formatTime24h(session.endsAt, timeZone),
        })}
      </Text>
      <Text variant="bodyStrong" {...tint}>
        {session.service.name}
      </Text>
      <Text {...tint}>{describeTeacherLine(session.teacher)}</Text>
      <Text color="ink2" {...tint}>
        {i18n.t('staffAgenda.rooms.seats', {
          booked: session.bookedCount,
          capacity: session.capacity,
        })}
      </Text>
      <SessionStateLines session={session} isFinished={isFinished} isMuted={isMuted} />
      <AttendeeList session={session} isFinished={isMuted} />
      {canJoinSession(session, now) ? (
        <AddPeopleButton isoDate={isoDate} sessionId={session.id} />
      ) : null}
      {isCancelled || isFinished ? null : <CancelSessionDayControl sessionId={session.id} />}
    </View>
  );
}
