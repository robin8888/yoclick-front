import { Pressable, View } from 'react-native';

import type { ClientListResponseDtoClientsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { resolveClientBadge } from '../model/client-display';
import { CLIENT_ROW_TEXT_STYLE, createClientRowStyle } from './ClientRow.styles';

const BADGE_TEXT_KEYS = {
  active: 'clients.badges.active',
  new: 'clients.badges.new',
  inactive: 'clients.badges.inactive',
  blocked: 'clients.badges.blocked',
} as const;

interface ClientRowProps {
  client: ClientListResponseDtoClientsItem;
  /** Nivel ya escrito con el vocabulario del sector; `null` si no tiene. */
  levelLabel: string | null;
  onPress: () => void;
}

/** Prototipo `aclients`: nombre, «Nivel · Grupo: X» y el estado con palabra. */
export function ClientRow({
  client,
  levelLabel,
  onPress,
}: Readonly<ClientRowProps>): React.JSX.Element {
  const theme = useTheme();
  const badge = resolveClientBadge(client);
  const subtitle = i18n.t('clients.rowSubtitle', {
    level: levelLabel ?? i18n.t('clients.noLevel'),
    group: client.group?.name ?? i18n.t('clients.noGroup'),
  });
  const badgeLabel = i18n.t(BADGE_TEXT_KEYS[badge.id]);

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${client.fullName}. ${subtitle}. ${badgeLabel}`}
      onPress={onPress}
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
      <Badge label={badgeLabel} tone={badge.tone} />
    </Pressable>
  );
}
