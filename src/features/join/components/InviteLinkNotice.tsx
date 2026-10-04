import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createInviteLinkNoticeStyle, INVITE_LINK_TEXT_STYLE } from './InviteLinkNotice.styles';

/** Explica que un enlace de invitación entra directo al centro (los abre el sistema, no la app). */
export function InviteLinkNotice(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createInviteLinkNoticeStyle(theme)}>
      <Icon name="mail" />
      <View style={INVITE_LINK_TEXT_STYLE}>
        <Text variant="body">
          {i18n.t('join.start.inviteNoticeLead')}
          <Text variant="bodyStrong">{i18n.t('join.start.inviteNoticeEmphasis')}</Text>
          {i18n.t('join.start.inviteNoticeTail')}
        </Text>
      </View>
    </View>
  );
}
