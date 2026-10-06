import { getApiErrorMessage } from '@/shared/api/errors';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Logo } from '@/ui/atoms/Logo';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';

import { LargeCodeField } from '../components/LargeCodeField';
import { InvitationFooter } from '../components/InvitationFooter';
import { InvitationPreview } from '../components/InvitationPreview';
import { useInvitationFlow } from '../hooks/useInvitationFlow';

const MAX_INVITATION_CODE_LENGTH = 24;

// Logotipo completo en blanco, del mismo tamaño que en el inicio de sesión y el registro.
const INVITATION_LOGO_HEIGHT = 110;

/** Quien es instructor o profesor entra a su centro con el código (o enlace) que le dieron. */
export function InvitationScreen(): React.JSX.Element {
  const signOut = useSignOutFlow();
  const { form, acceptance, invitation, failure, handleSecondaryPress } = useInvitationFlow();

  return (
    <ScreenTemplate
      isLoading={acceptance.isLoadingPreview || acceptance.isAccepting || signOut.isSigningOut}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('join.invitation.title')}
      subtitle={i18n.t('join.invitation.subtitle')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={INVITATION_LOGO_HEIGHT} />}
      footer={
        <InvitationFooter
          invitation={invitation}
          isCheckingCode={acceptance.isLoadingPreview}
          isAccepting={acceptance.isAccepting}
          onCodeSubmit={form.submitCode}
          onInvitationAccept={acceptance.acceptInvitation}
          onSecondaryPress={handleSecondaryPress}
        />
      }
    >
      {failure === null ? null : <FormErrorBanner message={getApiErrorMessage(failure)} />}
      {invitation === undefined ? (
        <LargeCodeField
          control={form.control}
          name="invitationCode"
          label={i18n.t('join.invitation.fieldLabel')}
          placeholder={i18n.t('join.invitation.placeholder')}
          maxLength={MAX_INVITATION_CODE_LENGTH}
          onSubmitEditing={form.submitCode}
        />
      ) : (
        <InvitationPreview invitation={invitation} />
      )}
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
