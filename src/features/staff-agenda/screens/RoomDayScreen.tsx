import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { createEntryCardStyle } from '../components/AgendaEntryCard.styles';
import { useRoomAgenda } from '../hooks/useRoomAgenda';
import { roomDayRouteParamsSchema } from '../model/room-day-route-params';
import { hasFreeSeats, type RoomDay, type RoomSession } from '../model/room-agenda';

interface SessionDetailProps {
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
        <Text key={attendee.bookingId}>{attendee.fullName}</Text>
      ))}
    </>
  );
}

/** Apuntar a más alumnos a la misma clase: abre «Nueva cita» en ese día y hora. */
function AddPeopleButton({
  isoDate,
  startTime,
}: Readonly<{ isoDate: string; startTime: string }>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      isFullWidth
      label={i18n.t('staffAgenda.session.addPeopleAction')}
      onPress={() => {
        router.push({
          pathname: '/(admin)/new-appointment',
          params: { date: isoDate, time: startTime },
        });
      }}
    />
  );
}

/** Una clase de la sala: horas, servicio, profesor, aforo y los alumnos apuntados. */
function SessionDetail({
  session,
  timeZone,
  isoDate,
}: Readonly<SessionDetailProps>): React.JSX.Element {
  const theme = useTheme();
  const startTime = formatTime24h(session.startsAt, timeZone);

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
      <AttendeeList session={session} />
      {session.mode === 'group' && hasFreeSeats(session) ? (
        <AddPeopleButton isoDate={isoDate} startTime={startTime} />
      ) : null}
    </View>
  );
}

function RoomDayBody({
  room,
  timeZone,
  isoDate,
}: Readonly<{ room: RoomDay | undefined; timeZone: string; isoDate: string }>): React.JSX.Element {
  if (room === undefined) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.roomNotFound')}</Text>;
  }
  if (room.sessions.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.freeAllDay')}</Text>;
  }
  return (
    <>
      {room.sessions.map((session) => (
        <SessionDetail key={session.id} session={session} timeZone={timeZone} isoDate={isoDate} />
      ))}
    </>
  );
}

function RoomDayContent({
  roomId,
  isoDate,
}: Readonly<{ roomId: string; isoDate: string }>): React.JSX.Element {
  const router = useRouter();
  const agenda = useRoomAgenda(isoDate);
  const room = agenda.data?.rooms.find((candidate) => candidate.id === roomId);

  return (
    <ScreenTemplate
      title={room?.name ?? i18n.t('staffAgenda.rooms.roomTitle')}
      subtitle={room && i18n.t('staffAgenda.rooms.roomSummary', { capacity: room.capacity })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {agenda.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {agenda.isError ? (
        <LoadErrorState
          title={i18n.t('staffAgenda.agenda.errorTitle')}
          error={agenda.error}
          onRetry={() => void agenda.refetch()}
          isRetrying={agenda.isFetching}
        />
      ) : null}
      {agenda.data === undefined ? null : (
        <RoomDayBody room={room} timeZone={agenda.data.timezone} isoDate={isoDate} />
      )}
    </ScreenTemplate>
  );
}

/** Detalle de una sala un día: qué clase la ocupa, de qué hora a qué hora, aforo y alumnos. */
export function RoomDayScreen(): React.JSX.Element {
  const params = roomDayRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return <RoomDayContent roomId={params.data.roomId} isoDate={params.data.date} />;
}
