import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { canJoinSession, type FoundSession } from '../model/room-agenda';
import { describeTeacherLine } from '../model/teacher-line';
import {
  createFactRowStyle,
  createSeatsFillStyle,
  createSeatsTrackStyle,
  createSessionCardStyle,
} from './SessionSummaryCard.styles';

const PERCENT = 100;

function Fact({
  iconName,
  text,
}: Readonly<{ iconName: IconName; text: string }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createFactRowStyle(theme)}>
      <Icon name={iconName} size="inline" color="ink2" />
      <Text color="ink2">{text}</Text>
    </View>
  );
}

/** Lo que ya se sabe de la clase: servicio, hora, profesor, sala y cuánto aforo queda. */
export function SessionSummaryCard({
  found,
  timeZone,
}: Readonly<{ found: FoundSession; timeZone: string }>): React.JSX.Element {
  const theme = useTheme();
  const { session, roomName } = found;
  const isJoinable = canJoinSession(session, new Date());
  const isFull = session.bookedCount >= session.capacity;
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(session.startsAt, timeZone),
    endTime: formatTime24h(session.endsAt, timeZone),
  });
  const fillPercent = Math.min(
    (session.bookedCount / Math.max(session.capacity, 1)) * PERCENT,
    PERCENT,
  );

  return (
    <View style={createSessionCardStyle(theme)}>
      <Text variant="titleMd">{session.service.name}</Text>
      <Fact iconName="clock" text={timeRange} />
      <Fact iconName="user" text={describeTeacherLine(session.teacher)} />
      {roomName === null ? null : <Fact iconName="mapPin" text={roomName} />}
      <View style={createSeatsTrackStyle(theme)} accessibilityElementsHidden>
        <View style={createSeatsFillStyle(theme, { fillPercent, isFull })} />
      </View>
      <Text color={isJoinable ? 'ink2' : 'danger'}>
        {isJoinable
          ? i18n.t('staffAgenda.rooms.seats', {
              booked: session.bookedCount,
              capacity: session.capacity,
            })
          : i18n.t('staffAgenda.newAppointment.sessionNotJoinable')}
      </Text>
    </View>
  );
}
