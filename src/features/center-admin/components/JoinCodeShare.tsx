import { Linking, View } from 'react-native';

import { buildCenterJoinLink } from '@/features/onboarding';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { QrCard } from '@/ui/organisms/QrCard';

import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { buildInviteMessage, buildWhatsAppShareUrl } from '../model/invite-messages';
import { BUTTON_ROW_STYLE, CODE_TEXT_STYLE, createShareCardStyle } from './JoinCodeShare.styles';

interface JoinCodeShareProps {
  centerName: string;
  joinCode: string;
}

interface ShareButtonsProps extends JoinCodeShareProps {
  joinLink: string;
}

function ShareButtons({
  centerName,
  joinCode,
  joinLink,
}: Readonly<ShareButtonsProps>): React.JSX.Element {
  const { copyText, isCopied } = useCopyToClipboard();

  return (
    <View style={BUTTON_ROW_STYLE}>
      <Button
        size="sm"
        leadingIconName={isCopied ? 'check' : 'copy'}
        label={
          isCopied
            ? i18n.t('centerAdmin.inviteClients.copiedAction')
            : i18n.t('centerAdmin.inviteClients.copyLinkAction')
        }
        onPress={() => {
          copyText(joinLink);
        }}
      />
      <Button
        size="sm"
        variant="secondary"
        label={i18n.t('centerAdmin.inviteClients.whatsAppAction')}
        onPress={() => {
          void Linking.openURL(
            buildWhatsAppShareUrl(buildInviteMessage({ centerName, joinCode, joinLink })),
          );
        }}
      />
    </View>
  );
}

/** Prototipo `ashare`: QR, código del centro, «Copiar enlace» y «Enviar por WhatsApp». */
export function JoinCodeShare({
  centerName,
  joinCode,
}: Readonly<JoinCodeShareProps>): React.JSX.Element {
  const theme = useTheme();
  const joinLink = buildCenterJoinLink(joinCode);

  return (
    <View style={createShareCardStyle(theme)}>
      <QrCard
        value={joinLink}
        accessibilityLabel={i18n.t('centerAdmin.inviteClients.qrLabel', { centerName })}
      />
      <Text variant="overline" color="ink2">
        {i18n.t('centerAdmin.inviteClients.codeLabel')}
      </Text>
      <View style={CODE_TEXT_STYLE}>
        <Text variant="display" color="brandInk" selectable>
          {joinCode}
        </Text>
      </View>
      <ShareButtons centerName={centerName} joinCode={joinCode} joinLink={joinLink} />
      <Text variant="caption" color="ink2" selectable>
        {joinLink}
      </Text>
    </View>
  );
}
