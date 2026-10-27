import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { buildFinishedLook, pickRoomPaletteColor, useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { isSessionRunning } from '../model/in-progress-label';
import { hasSessionEnded } from '../model/room-agenda';
import type { RoomMark } from '../model/room-marks';
import { buildClassSessionRoute } from '../model/session-route';
import type { TimelineBlock } from '../model/room-timeline';
import { getSeatState, type SeatState } from '../model/seat-state';
import { InProgressBadge } from './InProgressClock';
import {
  CHIP_STATUS_STYLE,
  CHIP_TEXT_STYLE,
  createChipCornerStyle,
  createChipHeaderStyle,
  createSessionCardStyle,
} from './RoomDayGrid.styles';
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
  /** Cada «sala» es un profesional (centro sin salas). */
  isStaffLane: boolean;
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

/** El servicio en negrita y debajo la hora, centrados; en una clase terminada, texto blanco sobre gris. */
function SessionCardText({
  serviceName,
  timeRange,
  isFinished,
}: Readonly<SessionCardTextProps>): React.JSX.Element {
  const { tint } = buildFinishedLook(isFinished);

  return (
    <View style={CHIP_TEXT_STYLE}>
      <Text variant="bodyStrong" align="center" numberOfLines={2} {...tint}>
        {serviceName}
      </Text>
      <Text color="ink2" align="center" {...tint}>
        {timeRange}
      </Text>
    </View>
  );
}

/**
 * Abre el detalle de la sala de esa clase, en el día que se está viendo. En un centro sin salas la
 * ficha es la cita de un profesional: se abre la cita.
 */
function useOpenBlock(block: TimelineBlock, isoDate: string, isStaffLane: boolean): () => void {
  const router = useRouter();

  return () => {
    const bookingId = block.session.attendees[0]?.bookingId;
    if (isStaffLane) {
      if (bookingId === undefined) return;
      router.push(buildClassSessionRoute({ bookingId, date: isoDate, isCenterWide: true }));
      return;
    }
    router.push({
      pathname: '/(admin)/room-day/[roomId]',
      params: { roomId: block.roomId, date: isoDate },
    });
  };
}

interface SeatsOrClockProps {
  block: TimelineBlock;
  seats: string;
  seatState: SeatState;
}

/** Con la clase en marcha, el tiempo que lleva; si no, las plazas (o su estado) con palabra. */
function SeatsOrClock({ block, seats, seatState }: Readonly<SeatsOrClockProps>): React.JSX.Element {
  const { session } = block;
  if (isSessionRunning(session)) return <InProgressBadge startedAt={session.startedAt} />;
  return <Badge label={seats} tone={SEAT_BADGE_TONES[seatState]} />;
}

interface SessionChipBodyProps extends SeatsOrClockProps {
  mark: RoomMark;
  timeRange: string;
  isMuted: boolean;
}

/** La letra de la sala con el servicio y las horas, y debajo el estado o el cronómetro. */
function SessionChipBody({
  block,
  mark,
  timeRange,
  seats,
  seatState,
  isMuted,
}: Readonly<SessionChipBodyProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <>
      <View style={createChipCornerStyle(theme)}>
        <RoomMarkDot mark={mark} />
      </View>
      <View style={createChipHeaderStyle(theme)}>
        <SessionCardText
          serviceName={block.session.service.name}
          timeRange={timeRange}
          isFinished={isMuted}
        />
      </View>
      <View style={CHIP_STATUS_STYLE}>
        <SeatsOrClock block={block} seats={seats} seatState={seatState} />
      </View>
    </>
  );
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
  isStaffLane,
}: Readonly<RoomSessionChipProps>): React.JSX.Element {
  const theme = useTheme();
  const openBlock = useOpenBlock(block, isoDate, isStaffLane);
  const seats = describeSeats(block, now);
  const seatState = getSeatState(block.session, now);
  const timeRange = describeTimeRange(block, timeZone);
  // Terminada o cancelada: gris con texto blanco.
  const isMuted = seatState === 'finished' || seatState === 'cancelled';

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.chipLabel', {
        room: mark.roomName,
        service: block.session.service.name,
        time: timeRange,
        seats,
      })}
      onPress={openBlock}
      style={[
        createSessionCardStyle(theme, pickRoomPaletteColor(mark.paletteIndex).background),
        buildFinishedLook(isMuted).cardStyle,
      ]}
    >
      <SessionChipBody
        block={block}
        mark={mark}
        timeRange={timeRange}
        seats={seats}
        seatState={seatState}
        isMuted={isMuted}
      />
    </Pressable>
  );
}
