import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { hasFreeSeats, type RoomSession } from '../model/room-agenda';
import { createEntryCardStyle } from './AgendaEntryCard.styles';
import { CancelSessionDayControl } from './CancelSessionDayControl';

interface RoomSessionDetailProps {
  session: RoomSession;
  timeZone: string;
  isoDate: string;
}

function AttendeeList({ session }: Readonly<{ session: RoomSession }>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('staffAgenda.rooms.attendeesTitle')}</Text>
      {session.attendees.length === 0 ? (
        <Text color="ink2">{i18n.t('staffAgenda.rooms.noAttendees')}</Text>
      ) : null}
      {session.attendees.map((attendee) => (
        <Text key={attendee.bookingId}>
          {attendee.source === 'enrollment'
            ? i18n.t('staffAgenda.rooms.enrollmentAttendee', { name: attendee.fullName })
            : attendee.fullName}
        </Text>
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

/** «Cancelada: motivo» o, si sigue en pie, «Horario fijo» y las acciones del día. */
function SessionStateLines({ session }: Readonly<{ session: RoomSession }>): React.JSX.Element {
  return (
    <>
      {session.schedule === null ? null : (
        <Text variant="caption" color="info">
          {session.schedule.label ?? i18n.t('staffAgenda.rooms.scheduleSession')}
        </Text>
      )}
      {session.cancelledReason === null ? null : (
        <Text color="danger" role="alert">
          {i18n.t('staffAgenda.rooms.cancelledSession', { reason: session.cancelledReason })}
        </Text>
      )}
    </>
  );
}

/** Una clase de la sala: horas, servicio, profesor, aforo, alumnos y «Cancelar este día». */
export function RoomSessionDetail({
  session,
  timeZone,
  isoDate,
}: Readonly<RoomSessionDetailProps>): React.JSX.Element {
  const theme = useTheme();
  const startTime = formatTime24h(session.startsAt, timeZone);
  const isCancelled = session.cancelledReason !== null;

  return (
    <View style={createEntryCardStyle(theme)}>
      <Text variant="titleMd" color="brandInk">
        {i18n.t('staffAgenda.agenda.timeRange', {
          startTime,
          endTime: formatTime24h(session.endsAt, timeZone),
        })}
      </Text>
      <Text variant="bodyStrong">{session.service.name}</Text>
      <Text>{i18n.t('staffAgenda.rooms.teacherLine', { teacher: session.teacher.fullName })}</Text>
      <Text color="ink2">
        {i18n.t('staffAgenda.rooms.seats', {
          booked: session.bookedCount,
          capacity: session.capacity,
        })}
      </Text>
      <SessionStateLines session={session} />
      <AttendeeList session={session} />
      {!isCancelled && session.mode === 'group' && hasFreeSeats(session) ? (
        <AddPeopleButton isoDate={isoDate} sessionId={session.id} />
      ) : null}
      {isCancelled ? null : <CancelSessionDayControl sessionId={session.id} />}
    </View>
  );
}
