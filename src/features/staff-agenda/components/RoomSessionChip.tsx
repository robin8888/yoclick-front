import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { RoomMark } from '../model/room-marks';
import type { TimelineBlock } from '../model/room-timeline';
import { getSeatState } from '../model/seat-state';
import { CHIP_TEXT_STYLE, createSessionChipStyle } from './RoomDayGrid.styles';
import { RoomMarkDot } from './RoomMarkDot';

interface RoomSessionChipProps {
  block: TimelineBlock;
  mark: RoomMark;
  timeZone: string;
  isoDate: string;
}

/** «3/12», «Completa», «Privada» o «Cancelada»: el estado con palabra o cifra, nunca solo color. */
function describeSeats(block: TimelineBlock): string {
  const { session } = block;
  if (session.cancelledReason !== null) return i18n.t('staffAgenda.rooms.chipCancelled');
  if (session.mode === 'private') return i18n.t('staffAgenda.rooms.chipPrivate');
  if (block.missingCount === 0) return i18n.t('staffAgenda.rooms.chipFull');
  return i18n.t('staffAgenda.rooms.chipSeats', {
    booked: session.bookedCount,
    capacity: session.capacity,
  });
}

/** Una clase en la rejilla: el punto de la sala y «Inglés B1 · 3/12»; al pulsar, el detalle de la sala. */
export function RoomSessionChip({
  block,
  mark,
  timeZone,
  isoDate,
}: Readonly<RoomSessionChipProps>): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const { session } = block;
  const seats = describeSeats(block);
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(session.startsAt, timeZone),
    endTime: formatTime24h(session.endsAt, timeZone),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.chipLabel', {
        room: mark.roomName,
        service: session.service.name,
        time: timeRange,
        seats,
      })}
      onPress={() => {
        router.push({
          pathname: '/(admin)/room-day/[roomId]',
          params: { roomId: block.roomId, date: isoDate },
        });
      }}
      style={createSessionChipStyle(theme, getSeatState(session))}
    >
      <RoomMarkDot mark={mark} />
      <View style={CHIP_TEXT_STYLE}>
        <Text variant="caption" color={session.cancelledReason === null ? 'ink' : 'ink2'}>
          {`${session.service.name} · ${seats}`}
        </Text>
      </View>
    </Pressable>
  );
}
