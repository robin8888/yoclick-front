import { Share, View } from 'react-native';

import { buildCenterJoinLink } from '@/features/onboarding';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { QrCard } from '@/ui/organisms/QrCard';

const SHARE_BLOCK_STYLE = { alignItems: 'center', gap: 12 } as const;

interface JoinCodeShareProps {
  centerName: string;
  joinCode: string;
}

/** QR, código y enlace del centro, con el botón de compartir del sistema (WhatsApp, correo…). */
export function JoinCodeShare({
  centerName,
  joinCode,
}: Readonly<JoinCodeShareProps>): React.JSX.Element {
  const joinLink = buildCenterJoinLink(joinCode);

  const shareJoinLink = (): void => {
    void Share.share({
      message: i18n.t('centerAdmin.inviteClients.shareMessage', { centerName, joinCode, joinLink }),
    });
  };

  return (
    <View style={SHARE_BLOCK_STYLE}>
      <QrCard
        value={joinLink}
        accessibilityLabel={i18n.t('centerAdmin.inviteClients.qrLabel', { centerName })}
      />
      <Text variant="overline" color="ink2">
        {i18n.t('centerAdmin.inviteClients.codeLabel')}
      </Text>
      <Text variant="display" color="brandInk" selectable>
        {joinCode}
      </Text>
      <Button
        leadingIconName="mail"
        label={i18n.t('centerAdmin.inviteClients.shareAction')}
        onPress={shareJoinLink}
      />
      <Text variant="caption" color="ink2" selectable>
        {joinLink}
      </Text>
    </View>
  );
}
