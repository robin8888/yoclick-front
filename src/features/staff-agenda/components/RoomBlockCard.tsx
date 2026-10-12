import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { RoomBlock } from '../model/room-timeline';
import { createRoomBlockCardStyle } from './RoomTimeline.styles';

interface RoomBlockCardProps {
  block: RoomBlock;
  timeZone: string;
  /** Solo en la línea temporal, donde conviven varias salas. */
  roomName?: string | undefined;
}

/** Un tramo bloqueado de la sala: motivo, horas y nota, con borde discontinuo (no es una clase). */
export function RoomBlockCard({
  block,
  timeZone,
  roomName,
}: Readonly<RoomBlockCardProps>): React.JSX.Element {
  const theme = useTheme();
  const reason = i18n.t(`staffAgenda.rooms.blockReason.${block.reason}`);
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(block.startsAt, timeZone),
    endTime: formatTime24h(block.endsAt, timeZone),
  });

  return (
    <View
      accessible
      accessibilityLabel={i18n.t('staffAgenda.rooms.blockedLabel', {
        room: roomName ?? '',
        reason,
        time: timeRange,
      })}
      style={createRoomBlockCardStyle(theme)}
    >
      {roomName === undefined ? null : <Text variant="bodyStrong">{roomName}</Text>}
      <Text>{i18n.t('staffAgenda.rooms.blockedTitle', { reason })}</Text>
      <Text variant="caption" color="ink2">
        {timeRange}
      </Text>
      {block.note === null ? null : (
        <Text variant="caption" color="ink2">
          {block.note}
        </Text>
      )}
    </View>
  );
}
