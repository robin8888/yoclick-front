import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { ADMIN_CARD_TEXT_STYLE, createAdminCardStyle } from './AdminCard.styles';

const ACTIONS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

interface PendingInvitationRowProps {
  /** Correo o teléfono al que se envió. */
  recipient: string;
  expiresOn: string;
  /** Crea otra invitación para el mismo destino: el código anterior deja de valer. */
  onResend: () => void;
  onRevoke: () => void;
}

/** Una invitación enviada que aún no se ha aceptado. */
export function PendingInvitationRow({
  recipient,
  expiresOn,
  onResend,
  onRevoke,
}: Readonly<PendingInvitationRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAdminCardStyle(theme)}>
      <Avatar name={recipient} isDecorative />
      <View style={ADMIN_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{recipient}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.team.expiresOn', { date: expiresOn })}
        </Text>
        <View style={ACTIONS_STYLE}>
          <Button
            size="sm"
            variant="secondary"
            label={i18n.t('centerAdmin.team.resendAction')}
            accessibilityLabel={i18n.t('centerAdmin.team.resendLabel', { recipient })}
            onPress={onResend}
          />
          <Button
            size="sm"
            variant="ghost"
            label={i18n.t('centerAdmin.team.revokeAction')}
            accessibilityLabel={i18n.t('centerAdmin.team.revokeLabel', { recipient })}
            onPress={onRevoke}
          />
        </View>
      </View>
      <Badge tone="info" label={i18n.t('centerAdmin.team.pendingBadge')} />
    </View>
  );
}
