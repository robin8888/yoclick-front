import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { listTeachersOfRoomDay, type RoomDay } from '../model/room-agenda';
import { createEntryCardStyle } from './AgendaEntryCard.styles';
import { RoomSessionRows } from './RoomSessionRows';

interface RoomCardProps {
  room: RoomDay;
  timeZone: string;
  isoDate: string;
}

/** Una sala: aforo, profesor y a qué horas está ocupada. Al pulsarla, el detalle del día. */
function RoomCard({ room, timeZone, isoDate }: Readonly<RoomCardProps>): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const teachers = room.staff === null ? listTeachersOfRoomDay(room) : [room.staff.fullName];

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.openRoomLabel', {
        name: room.name,
        capacity: room.capacity,
      })}
      onPress={() => {
        router.push({
          pathname: '/(admin)/room-day/[roomId]',
          params: { roomId: room.id, date: isoDate },
        });
      }}
      style={createEntryCardStyle(theme)}
    >
      <Text variant="titleMd">{room.name}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.rooms.roomSummary', { capacity: room.capacity })}
        {teachers.length === 0
          ? ''
          : ` · ${i18n.t('staffAgenda.rooms.teachers', { names: teachers.join(', ') })}`}
      </Text>
      <RoomSessionRows sessions={room.sessions} timeZone={timeZone} />
    </Pressable>
  );
}

interface RoomAgendaListProps {
  agenda: RoomAgendaResponseDto;
  isoDate: string;
}

/** La agenda del centro por sala: lo que necesita saber el centro de cada una. */
export function RoomAgendaList({
  agenda,
  isoDate,
}: Readonly<RoomAgendaListProps>): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      {agenda.rooms.map((room) => (
        <RoomCard key={room.id} room={room} timeZone={agenda.timezone} isoDate={isoDate} />
      ))}
      {agenda.sessionsWithoutRoom.length === 0 ? null : (
        <Pressable
          role="button"
          accessibilityLabel={i18n.t('staffAgenda.rooms.withoutRoomTitle')}
          onPress={() => {
            const first = agenda.sessionsWithoutRoom[0]?.attendees[0];
            if (first === undefined) return;
            router.push({
              pathname: '/(staff)/sessions/[bookingId]',
              params: { bookingId: first.bookingId, date: isoDate, isCenterWide: 'true' },
            });
          }}
          style={createEntryCardStyle(theme)}
        >
          <Text variant="titleMd">{i18n.t('staffAgenda.rooms.withoutRoomTitle')}</Text>
          <RoomSessionRows sessions={agenda.sessionsWithoutRoom} timeZone={agenda.timezone} />
        </Pressable>
      )}
    </>
  );
}
