import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { buildFinishedLook, pickRoomPaletteColor, useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { hasSessionEnded } from '../model/room-agenda';
import type { RoomMark } from '../model/room-marks';
import type { TimelineBlock } from '../model/room-timeline';
import { getSeatState, type SeatState } from '../model/seat-state';
import { CHIP_TEXT_STYLE, createSessionCardStyle } from './RoomDayGrid.styles';
import { RoomMarkDot } from './RoomMarkDot';

const SEAT_BADGE_TONES: Readonly<Record<SeatState, BadgeTone>> = {
  open: 'warning',
  full: 'success',
  private: 'neutral',
  cancelled: 'neutral',
  finished: 'neutral',
};

interface RoomSessionChipProps {
  block: TimelineBlock;
  mark: RoomMark;
  timeZone: string;
  isoDate: string;
  now: Date;
}

/** «3/12», «Completa», «Privada», «Terminada» o «Cancelada»: el estado con palabra o cifra, nunca solo color. */
function describeSeats(block: TimelineBlock, now: Date): string {
  const { session } = block;
  if (session.cancelledReason !== null) return i18n.t('staffAgenda.rooms.chipCancelled');
  if (hasSessionEnded(session, now)) return i18n.t('staffAgenda.rooms.chipFinished');
  if (session.mode === 'private') return i18n.t('staffAgenda.rooms.chipPrivate');
  if (block.missingCount === 0) return i18n.t('staffAgenda.rooms.chipFull');
  return i18n.t('staffAgenda.rooms.chipSeats', {
    booked: session.bookedCount,
    capacity: session.capacity,
  });
}

function describeTimeRange(block: TimelineBlock, timeZone: string): string {
  const { session } = block;
  return i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(session.startsAt, timeZone),
    endTime: formatTime24h(session.endsAt, timeZone),
  });
}

interface SessionCardTextProps {
  serviceName: string;
  timeRange: string;
  isFinished: boolean;
}

/** El servicio en negrita y debajo la hora; en una clase terminada, texto blanco sobre gris. */
function SessionCardText({
  serviceName,
  timeRange,
  isFinished,
}: Readonly<SessionCardTextProps>): React.JSX.Element {
  const { tint } = buildFinishedLook(isFinished);

  return (
    <View style={CHIP_TEXT_STYLE}>
      <Text variant="bodyStrong" numberOfLines={1} {...tint}>
        {serviceName}
      </Text>
      <Text variant="caption" color="ink2" {...tint}>
        {timeRange}
      </Text>
    </View>
  );
}

/** Abre el detalle de la sala de esa clase, en el día que se está viendo. */
function useOpenRoomDay(roomId: string, isoDate: string): () => void {
  const router = useRouter();

  return () => {
    router.push({ pathname: '/(admin)/room-day/[roomId]', params: { roomId, date: isoDate } });
  };
}

/**
 * Una clase en la agenda del centro, como tarjeta: letra de la sala, servicio, horas y el estado
 * de las plazas como etiqueta. La franja de la izquierda lleva el color de su sala. Al pulsarla
 * se abre el detalle de la sala.
 */
export function RoomSessionChip({
  block,
  mark,
  timeZone,
  isoDate,
  now,
}: Readonly<RoomSessionChipProps>): React.JSX.Element {
  const theme = useTheme();
  const openRoomDay = useOpenRoomDay(block.roomId, isoDate);
  const { session } = block;
  const seats = describeSeats(block, now);
  const seatState = getSeatState(session, now);
  const timeRange = describeTimeRange(block, timeZone);
  // Terminada o cancelada: gris con texto blanco.
  const isMuted = seatState === 'finished' || seatState === 'cancelled';
  const { cardStyle } = buildFinishedLook(isMuted);

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.chipLabel', {
        room: mark.roomName,
        service: session.service.name,
        time: timeRange,
        seats,
      })}
      onPress={openRoomDay}
      style={[
        createSessionCardStyle(theme, pickRoomPaletteColor(mark.paletteIndex).background),
        cardStyle,
      ]}
    >
      <RoomMarkDot mark={mark} />
      <SessionCardText
        serviceName={session.service.name}
        timeRange={timeRange}
        isFinished={isMuted}
      />
      <Badge label={seats} tone={SEAT_BADGE_TONES[seatState]} />
    </Pressable>
  );
}
