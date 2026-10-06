import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { CLIENT_ROW_TEXT_STYLE, createClientRowStyle } from './ClientRow.styles';

interface StaffClientRowProps {
  client: ClientListResponseDtoClientsItem;
  /** Nivel ya escrito con el vocabulario del sector; `null` si no tiene. */
  levelLabel: string | null;
}

function describeSessions(client: ClientListResponseDtoClientsItem): string {
  const sessions = i18n.t('clients.staffRow.sessions', { count: client.bookingCount });
  if (client.nextBookingAt === null) return sessions;
  const next = i18n.t('clients.staffRow.next', {
    day: formatShortDate(client.nextBookingAt, DEFAULT_CENTER_TIME_ZONE),
    time: formatTime24h(client.nextBookingAt, DEFAULT_CENTER_TIME_ZONE),
  });
  return `${sessions} · ${next}`;
}

/** Prototipo `iclients`: nombre, «N sesiones · Próxima: …» y el nivel como etiqueta. */
export function StaffClientRow({
  client,
  levelLabel,
}: Readonly<StaffClientRowProps>): React.JSX.Element {
  const theme = useTheme();
  const subtitle = describeSessions(client);
  const spokenParts = [client.fullName, subtitle, levelLabel].filter(Boolean);

  return (
    <View
      accessible
      accessibilityLabel={spokenParts.join('. ')}
      style={createClientRowStyle(theme)}
    >
      <Avatar name={client.fullName} size="md" isDecorative />
      <View style={CLIENT_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {client.fullName}
        </Text>
        <Text variant="caption" color="ink2" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {levelLabel === null ? null : <Badge label={levelLabel} tone="neutral" />}
    </View>
  );
}
