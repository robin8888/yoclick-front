import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { ADMIN_CARD_TEXT_STYLE, createAdminCardStyle } from './AdminCard.styles';

interface PendingInvitationRowProps {
  email: string;
}

/** Una invitación enviada que aún no se ha aceptado. */
export function PendingInvitationRow({
  email,
}: Readonly<PendingInvitationRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAdminCardStyle(theme)}>
      <Avatar name={email} isDecorative />
      <View style={ADMIN_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{email}</Text>
      </View>
      <Badge tone="info" label={i18n.t('centerAdmin.team.pendingBadge')} />
    </View>
  );
}
