import { Pressable, View } from 'react-native';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { describeBookingAssigner } from '@/shared/lib/booking-assigner';
import { describeBookingRoom } from '@/shared/lib/booking-room';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { buildFinishedLook, useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { resolveAgendaPhase, type AgendaPhase } from '../model/session-phase';
import { createEntryCardStyle, ENTRY_HEADER_STYLE } from './AgendaEntryCard.styles';

const PHASE_TONES: Readonly<Record<AgendaPhase, BadgeTone>> = {
  'not-started': 'neutral',
  'in-progress': 'brand',
  finished: 'success',
  cancelled: 'neutral',
  past: 'neutral',
};

interface AgendaEntryCardProps {
  entry: AgendaResponseDtoEntriesItem;
  timeZone: string;
  /** El profesional solo se nombra en la agenda del centro (la de administración). */
  shouldShowStaffName: boolean;
  now: Date;
  onPress: () => void;
}

interface AgendaEntryCaptionsProps {
  booking: AgendaResponseDtoEntriesItem['booking'];
  shouldShowStaffName: boolean;
  /** Texto blanco sobre el gris de una cita terminada; sin él, los colores normales. */
  tint: { tintColor?: string };
}

/** Líneas secundarias de la cita: quién la asignó y, en la agenda del centro, quién la atiende. */
function AgendaEntryCaptions({
  booking,
  shouldShowStaffName,
  tint,
}: Readonly<AgendaEntryCaptionsProps>): React.JSX.Element {
  const assignedByLabel = describeBookingAssigner(booking.createdBy);
  const roomLabel = describeBookingRoom(booking, { shouldShowSeats: true });

  return (
    <>
      {roomLabel === null ? null : (
        <Text variant="caption" {...tint}>
          {roomLabel}
        </Text>
      )}
      {assignedByLabel === null ? null : (
        <Text variant="caption" color="ink2" {...tint}>
          {assignedByLabel}
        </Text>
      )}
      {shouldShowStaffName ? (
        <Text variant="caption" color="ink2" {...tint}>
          {i18n.t('staffAgenda.agenda.professional', { staffName: booking.staff.fullName })}
        </Text>
      ) : null}
    </>
  );
}

function AgendaEntryHeader({
  timeRange,
  phase,
  tint,
}: Readonly<{
  timeRange: string;
  phase: AgendaPhase;
  tint: { tintColor?: string };
}>): React.JSX.Element {
  return (
    <View style={ENTRY_HEADER_STYLE}>
      <Text variant="titleMd" color="brandInk" {...tint}>
        {timeRange}
      </Text>
      <Badge label={i18n.t(`staffAgenda.agenda.phase.${phase}`)} tone={PHASE_TONES[phase]} />
    </View>
  );
}

/** Las citas que ya terminaron, pasaron o se cancelaron se pintan en gris con texto blanco. */
function isFinishedPhase(phase: AgendaPhase): boolean {
  return phase === 'finished' || phase === 'past' || phase === 'cancelled';
}

/** Una cita de la agenda: hora, servicio, cliente y en qué punto está la clase. */
export function AgendaEntryCard({
  entry,
  timeZone,
  shouldShowStaffName,
  now,
  onPress,
}: Readonly<AgendaEntryCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { booking, client } = entry;
  const phase = resolveAgendaPhase(booking, now);
  const { tint, cardStyle } = buildFinishedLook(isFinishedPhase(phase));
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(booking.startsAt, timeZone),
    endTime: formatTime24h(booking.endsAt, timeZone),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${timeRange}. ${booking.service.name}. ${client.fullName}`}
      onPress={onPress}
      style={[createEntryCardStyle(theme), cardStyle]}
    >
      <AgendaEntryHeader timeRange={timeRange} phase={phase} tint={tint} />
      <Text variant="bodyStrong" {...tint}>
        {booking.service.name}
      </Text>
      <Text color="ink2" {...tint}>
        {i18n.t('staffAgenda.agenda.withClient', { clientName: client.fullName })}
      </Text>
      <AgendaEntryCaptions
        booking={booking}
        shouldShowStaffName={shouldShowStaffName}
        tint={tint}
      />
    </Pressable>
  );
}
