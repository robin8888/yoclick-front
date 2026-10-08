import { View } from 'react-native';

import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { platformCardColors } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { describeInvitedRole } from '../model/invitation-role-label';
import { INVITATION_PREVIEW_STYLE, INVITATION_ROLE_PILL_STYLE } from './InvitationPreview.styles';

interface InvitationPreviewProps {
  invitation: InvitationPreviewResponseDto;
}

/** Centro y rol que da la invitación, en una tarjeta blanca para que se compruebe antes de aceptar. */
export function InvitationPreview({
  invitation,
}: Readonly<InvitationPreviewProps>): React.JSX.Element {
  return (
    <View style={INVITATION_PREVIEW_STYLE}>
      <Avatar
        name={invitation.center.name}
        photoUrl={resolveApiAssetUrl(invitation.center.logoUrl)}
        size="xl"
        isDecorative
      />
      <Text variant="titleMd" align="center" tintColor={platformCardColors.title}>
        {i18n.t('join.invitation.previewTitle', { centerName: invitation.center.name })}
      </Text>
      <View style={INVITATION_ROLE_PILL_STYLE}>
        <Text variant="bodyStrong" tintColor={platformCardColors.icon}>
          {i18n.t('join.invitation.previewRole', { roleName: describeInvitedRole(invitation) })}
        </Text>
      </View>
      {invitation.emailHint === null ? null : (
        <Text variant="caption" align="center" tintColor={platformCardColors.description}>
          {i18n.t('join.invitation.previewEmailHint', { emailHint: invitation.emailHint })}
        </Text>
      )}
    </View>
  );
}
