import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface InvitationFooterProps {
  /** Con invitación consultada se ofrece aceptarla; sin ella, enviar el código. */
  invitation: InvitationPreviewResponseDto | undefined;
  isCheckingCode: boolean;
  isAccepting: boolean;
  onCodeSubmit: () => void;
  onInvitationAccept: () => void;
  onSecondaryPress: () => void;
}

export function InvitationFooter({
  invitation,
  isCheckingCode,
  isAccepting,
  onCodeSubmit,
  onInvitationAccept,
  onSecondaryPress,
}: Readonly<InvitationFooterProps>): React.JSX.Element {
  const hasInvitation = invitation !== undefined;

  return (
    <>
      <Button
        label={
          hasInvitation
            ? i18n.t('join.invitation.acceptLabel')
            : i18n.t('join.invitation.submitLabel')
        }
        isFullWidth
        isLoading={hasInvitation ? isAccepting : isCheckingCode}
        onPress={hasInvitation ? onInvitationAccept : onCodeSubmit}
      />
      <Button
        variant="ghost"
        label={
          hasInvitation
            ? i18n.t('join.invitation.changeCodeAction')
            : i18n.t('join.invitation.skipAction')
        }
        isFullWidth
        onPress={onSecondaryPress}
      />
    </>
  );
}
