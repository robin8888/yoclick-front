import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { buildCenterJoinLink } from '@/features/onboarding';
import { i18n } from '@/shared/i18n';
import { ListItem } from '@/ui/molecules/ListItem';

import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { buildInviteMessage } from '../model/invite-messages';
import { SHARE_TOOLS_STYLE } from './ShareToolsList.styles';

interface ShareToolsListProps {
  centerName: string;
  joinCode: string;
}

/** Prototipo `ashare`: cartel para recepción, mensaje listo para enviar y enlace para Instagram. */
export function ShareToolsList({
  centerName,
  joinCode,
}: Readonly<ShareToolsListProps>): React.JSX.Element {
  const router = useRouter();
  const { copyText, isCopied } = useCopyToClipboard();
  const joinLink = buildCenterJoinLink(joinCode);

  return (
    <View style={SHARE_TOOLS_STYLE}>
      <ListItem
        leadingIconName="file"
        title={i18n.t('centerAdmin.inviteClients.posterTitle')}
        subtitle={i18n.t('centerAdmin.inviteClients.posterSubtitle')}
        onPress={() => {
          router.push('/(admin)/poster');
        }}
      />
      <ListItem
        leadingIconName={isCopied ? 'check' : 'mail'}
        title={i18n.t('centerAdmin.inviteClients.messageTitle')}
        subtitle={
          isCopied
            ? i18n.t('centerAdmin.inviteClients.copiedAction')
            : i18n.t('centerAdmin.inviteClients.messageSubtitle')
        }
        onPress={() => {
          copyText(buildInviteMessage({ centerName, joinCode, joinLink }));
        }}
      />
      <ListItem
        leadingIconName="users"
        title={i18n.t('centerAdmin.inviteClients.instagramTitle')}
        subtitle={i18n.t('centerAdmin.inviteClients.instagramSubtitle')}
        onPress={() => {
          copyText(joinLink);
        }}
      />
    </View>
  );
}
