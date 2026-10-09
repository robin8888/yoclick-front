import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { LevelPill } from './LevelPill';
import { CLIENT_ROW_TEXT_STYLE } from './ClientRow.styles';
import {
  createNextAppointmentStyle,
  createStaffClientHeadStyle,
  createStaffClientRowStyle,
} from './StaffClientRow.styles';

interface StaffClientRowProps {
  client: ClientListResponseDtoClientsItem;
  /** Nivel ya escrito con el vocabulario del sector; `null` si no tiene. */
  levelLabel: string | null;
}

function describeNextAppointment(client: ClientListResponseDtoClientsItem): string {
  if (client.nextBookingAt === null) return i18n.t('clients.staffRow.noNext');
  return i18n.t('clients.staffRow.next', {
    day: formatShortDate(client.nextBookingAt, DEFAULT_CENTER_TIME_ZONE),
    time: formatTime24h(client.nextBookingAt, DEFAULT_CENTER_TIME_ZONE),
  });
}

/** Prototipo `iclients`: una tarjeta por persona con avatar, nombre, nivel, sesiones y la próxima cita destacada. */
export function StaffClientRow({
  client,
  levelLabel,
}: Readonly<StaffClientRowProps>): React.JSX.Element {
  const theme = useTheme();
  const sessions = i18n.t('clients.staffRow.sessions', { count: client.bookingCount });
  const nextAppointment = describeNextAppointment(client);
  const hasNext = client.nextBookingAt !== null;
  const spokenParts = [client.fullName, sessions, nextAppointment, levelLabel].filter(Boolean);

  return (
    <View
      accessible
      accessibilityLabel={spokenParts.join('. ')}
      style={createStaffClientRowStyle(theme)}
    >
      <Avatar name={client.fullName} size="lg" isDecorative />
      <View style={CLIENT_ROW_TEXT_STYLE}>
        <View style={createStaffClientHeadStyle(theme)}>
          <View style={CLIENT_ROW_TEXT_STYLE}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {client.fullName}
            </Text>
          </View>
          {levelLabel === null || client.level === null ? null : (
            <LevelPill level={client.level} label={levelLabel} />
          )}
        </View>
        <Text variant="caption" color="ink2">
          {sessions}
        </Text>
        <View style={createNextAppointmentStyle(theme)}>
          <Icon name="calendar" size="inline" color={hasNext ? 'brandInk' : 'ink2'} />
          <Text variant="caption" color={hasNext ? 'brandInk' : 'ink2'}>
            {nextAppointment}
          </Text>
        </View>
      </View>
    </View>
  );
}
