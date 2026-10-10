import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { hasFreeSeats, type RoomSession } from '../model/room-agenda';

const ROW_STYLE = { gap: 4 } as const;
const ROW_HEADER_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
} as const;

interface RoomSessionRowsProps {
  sessions: readonly RoomSession[];
  timeZone: string;
}

function RoomSessionRow({
  session,
  timeZone,
}: Readonly<{ session: RoomSession; timeZone: string }>): React.JSX.Element {
  const hasSeats = hasFreeSeats(session);

  return (
    <View style={ROW_STYLE}>
      <View style={ROW_HEADER_STYLE}>
        <Text variant="bodyStrong" color="brandInk">
          {i18n.t('staffAgenda.agenda.timeRange', {
            startTime: formatTime24h(session.startsAt, timeZone),
            endTime: formatTime24h(session.endsAt, timeZone),
          })}
        </Text>
        <Badge
          label={i18n.t(hasSeats ? 'staffAgenda.rooms.hasSeats' : 'staffAgenda.rooms.isFull')}
          tone={hasSeats ? 'neutral' : 'success'}
        />
      </View>
      <Text>
        {i18n.t('staffAgenda.rooms.classAndTeacher', {
          service: session.service.name,
          teacher: session.teacher.fullName,
        })}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.rooms.seats', {
          booked: session.bookedCount,
          capacity: session.capacity,
        })}
      </Text>
    </View>
  );
}

/** Cada clase de la sala: de qué hora a qué hora, qué servicio, qué profesor y cuántas plazas. */
export function RoomSessionRows({
  sessions,
  timeZone,
}: Readonly<RoomSessionRowsProps>): React.JSX.Element {
  if (sessions.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.freeAllDay')}</Text>;
  }
  return (
    <>
      {sessions.map((session) => (
        <RoomSessionRow key={session.id} session={session} timeZone={timeZone} />
      ))}
    </>
  );
}
