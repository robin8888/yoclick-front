import { Linking, View } from 'react-native';

import type { InvitationResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import {
  buildInvitationLink,
  buildSmsShareUrl,
  buildWhatsAppShareUrl,
} from '../model/invite-messages';
import { BUTTON_ROW_STYLE, createShareCardStyle } from './JoinCodeShare.styles';

const ISO_DATE_LENGTH = 10;

interface InvitationReadyCardProps {
  invitation: InvitationResponseDto;
  centerName: string;
  /** «alumno», «instructor»… tal como lo llama el centro. */
  roleWord: string;
  onAnotherPress: () => void;
}

function describeRecipient(invitation: InvitationResponseDto): string {
  const expiresOn = formatNumericDate(invitation.expiresAt.slice(0, ISO_DATE_LENGTH));
  return invitation.email === null
    ? i18n.t('centerAdmin.team.phoneNote', { phone: invitation.phone ?? '', expiresOn })
    : i18n.t('centerAdmin.team.emailSentNote', { email: invitation.email });
}

function CopyCodeButton({ code }: Readonly<{ code: string }>): React.JSX.Element {
  const { copyText, isCopied } = useCopyToClipboard();

  return (
    <Button
      size="sm"
      variant="secondary"
      leadingIconName={isCopied ? 'check' : 'copy'}
      label={i18n.t(isCopied ? 'centerAdmin.team.copiedAction' : 'centerAdmin.team.copyCodeAction')}
      onPress={() => {
        copyText(code);
      }}
    />
  );
}

type ShareActionsProps = Pick<InvitationReadyCardProps, 'invitation' | 'centerName' | 'roleWord'>;

/** WhatsApp (al chat del teléfono si lo hay), SMS (solo con teléfono) y copiar el código. */
function ShareActions({
  invitation,
  centerName,
  roleWord,
}: Readonly<ShareActionsProps>): React.JSX.Element {
  const { phone } = invitation;
  const message = i18n.t('centerAdmin.team.shareMessage', {
    centerName,
    roleWord,
    code: invitation.code,
    link: buildInvitationLink(invitation.code),
  });

  return (
    <View style={BUTTON_ROW_STYLE}>
      <Button
        size="sm"
        label={i18n.t('centerAdmin.team.whatsAppAction')}
        onPress={() => {
          void Linking.openURL(buildWhatsAppShareUrl(message, phone ?? undefined));
        }}
      />
      {phone === null ? null : (
        <Button
          size="sm"
          variant="secondary"
          label={i18n.t('centerAdmin.team.smsAction')}
          onPress={() => {
            void Linking.openURL(buildSmsShareUrl(phone, message));
          }}
        />
      )}
      <CopyCodeButton code={invitation.code} />
    </View>
  );
}

/** La invitación recién creada: el código a la vista y las formas de enviarlo desde este móvil. */
export function InvitationReadyCard({
  invitation,
  centerName,
  roleWord,
  onAnotherPress,
}: Readonly<InvitationReadyCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createShareCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.team.readyTitle')}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.team.codeLabel')}
      </Text>
      <Text variant="display" color="brandInk" selectable>
        {invitation.code}
      </Text>
      <Text color="ink2" align="center">
        {describeRecipient(invitation)}
      </Text>
      <ShareActions invitation={invitation} centerName={centerName} roleWord={roleWord} />
      <Button
        variant="ghost"
        label={i18n.t('centerAdmin.team.anotherAction')}
        onPress={onAnotherPress}
      />
    </View>
  );
}
