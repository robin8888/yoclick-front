import { Pressable, View } from 'react-native';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { resolveSessionPhase, type SessionPhase } from '../model/session-phase';
import { createEntryCardStyle, ENTRY_HEADER_STYLE } from './AgendaEntryCard.styles';

const PHASE_TONES: Readonly<Record<SessionPhase, BadgeTone>> = {
  'not-started': 'neutral',
  'in-progress': 'brand',
  finished: 'success',
  cancelled: 'neutral',
};

interface AgendaEntryCardProps {
  entry: AgendaResponseDtoEntriesItem;
  timeZone: string;
  /** El profesional solo se nombra en la agenda del centro (la de administración). */
  shouldShowStaffName: boolean;
  onPress: () => void;
}

/** Una cita de la agenda: hora, servicio, cliente y en qué punto está la clase. */
export function AgendaEntryCard({
  entry,
  timeZone,
  shouldShowStaffName,
  onPress,
}: Readonly<AgendaEntryCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { booking, client } = entry;
  const phase = resolveSessionPhase(booking);
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(booking.startsAt, timeZone),
    endTime: formatTime24h(booking.endsAt, timeZone),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${timeRange}. ${booking.service.name}. ${client.fullName}`}
      onPress={onPress}
      style={createEntryCardStyle(theme)}
    >
      <View style={ENTRY_HEADER_STYLE}>
        <Text variant="titleMd" color="brandInk">
          {timeRange}
        </Text>
        <Badge label={i18n.t(`staffAgenda.agenda.phase.${phase}`)} tone={PHASE_TONES[phase]} />
      </View>
      <Text variant="bodyStrong">{booking.service.name}</Text>
      <Text color="ink2">
        {i18n.t('staffAgenda.agenda.withClient', { clientName: client.fullName })}
      </Text>
      {shouldShowStaffName ? (
        <Text variant="caption" color="ink2">
          {i18n.t('staffAgenda.agenda.professional', { staffName: booking.staff.fullName })}
        </Text>
      ) : null}
    </Pressable>
  );
}
