import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { LevelPill } from './LevelPill';
import { CLIENT_ROW_TEXT_STYLE } from './ClientRow.styles';
import { createStaffClientRowStyle } from './StaffClientRow.styles';

interface StaffClientRowProps {
  client: ClientListResponseDtoClientsItem;
  /** Nivel ya escrito con el vocabulario del sector; `null` si no tiene. */
  levelLabel: string | null;
  /** La última fila no lleva línea debajo: la tarjeta ya tiene borde. */
  isLast: boolean;
}

function describeSessions(client: ClientListResponseDtoClientsItem): string {
  const sessions = i18n.t('clients.staffRow.sessions', { count: client.bookingCount });
  if (client.nextBookingAt === null) return `${sessions} · ${i18n.t('clients.staffRow.noNext')}`;
  const next = i18n.t('clients.staffRow.next', {
    day: formatShortDate(client.nextBookingAt, DEFAULT_CENTER_TIME_ZONE),
    time: formatTime24h(client.nextBookingAt, DEFAULT_CENTER_TIME_ZONE),
  });
  return `${sessions} · ${next}`;
}

/** Prototipo `iclients`: iniciales, nombre, «N sesiones · Próxima: …» y el nivel como pastilla. */
export function StaffClientRow({
  client,
  levelLabel,
  isLast,
}: Readonly<StaffClientRowProps>): React.JSX.Element {
  const theme = useTheme();
  const subtitle = describeSessions(client);
  const spokenParts = [client.fullName, subtitle, levelLabel].filter(Boolean);

  return (
    <View
      accessible
      accessibilityLabel={spokenParts.join('. ')}
      style={createStaffClientRowStyle(theme, isLast)}
    >
      <Avatar name={client.fullName} size="md" isDecorative />
      <View style={CLIENT_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong">{client.fullName}</Text>
        <Text variant="caption" color="ink2">
          {subtitle}
        </Text>
      </View>
      {levelLabel === null || client.level === null ? null : (
        <LevelPill level={client.level} label={levelLabel} />
      )}
    </View>
  );
}
