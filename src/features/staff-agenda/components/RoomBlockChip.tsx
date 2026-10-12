import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import type { RoomMark } from '../model/room-marks';
import type { TimelineRoomBlock } from '../model/room-timeline';
import { CHIP_TEXT_STYLE, createBlockChipStyle } from './RoomDayGrid.styles';
import { RoomMarkDot } from './RoomMarkDot';

interface RoomBlockChipProps {
  roomBlock: TimelineRoomBlock;
  mark: RoomMark;
  timeZone: string;
}

/** Un bloqueo en la rejilla: el punto de la sala, un candado y el motivo con las horas. */
export function RoomBlockChip({
  roomBlock,
  mark,
  timeZone,
}: Readonly<RoomBlockChipProps>): React.JSX.Element {
  const theme = useTheme();
  const { block } = roomBlock;
  const reason = i18n.t(`staffAgenda.rooms.blockReason.${block.reason}`);
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(block.startsAt, timeZone),
    endTime: formatTime24h(block.endsAt, timeZone),
  });

  return (
    <View
      accessible
      accessibilityLabel={i18n.t('staffAgenda.rooms.blockedLabel', {
        room: mark.roomName,
        reason,
        time: timeRange,
      })}
      style={createBlockChipStyle(theme)}
    >
      <RoomMarkDot mark={mark} />
      <Icon name="lock" size="inline" color="ink2" />
      <View style={CHIP_TEXT_STYLE}>
        <Text variant="caption" color="ink2">
          {`${reason} · ${timeRange}`}
        </Text>
      </View>
    </View>
  );
}
