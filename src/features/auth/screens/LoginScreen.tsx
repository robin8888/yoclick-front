import { useRouter } from 'expo-router';

import {
  describeInvitedRole,
  useInvitedCenterPreview,
  usePendingCenterStore,
} from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthBrandHeader, useHasPlatformLook } from '../components/AuthBrandHeader';
import { AuthLinkButton } from '../components/AuthLinkButton';
import { AuthNoticeBanner } from '../components/AuthNoticeBanner';
import { EmailTextField } from '../components/EmailTextField';
import { LoginFooter } from '../components/LoginFooter';
import { PasswordTextField } from '../components/PasswordTextField';
import { useLoginForm } from '../hooks/useLoginForm';

// Logotipo completo en blanco, más pequeño que en el inicio para dejar sitio al formulario.
const LOGIN_LOGO_HEIGHT = 110;

function buildLoginSubtitle(
  pendingCenterName: string | undefined,
  invitation: ReturnType<typeof useInvitedCenterPreview>,
): string {
  if (invitation !== undefined) {
    return i18n.t('join.invitation.loginSubtitle', {
      centerName: invitation.center.name,
      roleName: describeInvitedRole(invitation),
    });
  }
  if (pendingCenterName === undefined) return i18n.t('auth.login.subtitleWithoutCenter');
  return i18n.t('auth.login.subtitleWithCenter', { centerName: pendingCenterName });
}

/** Prototipo `login`. Apple y Google quedan fuera hasta decidir el inicio de sesión social. */
export function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const pendingCenterName = usePendingCenterStore((state) => state.pendingCenter?.name);
  const invitation = useInvitedCenterPreview();
  const hasPlatformLook = useHasPlatformLook();
  const { control, submitLogin, isSubmitting, errorMessage } = useLoginForm();
  const subtitle = buildLoginSubtitle(pendingCenterName, invitation);

  return (
    <ScreenTemplate
      title={i18n.t('auth.login.title')}
      subtitle={subtitle}
      isLoading={isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.canGoBack() ? router.back : undefined}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground={hasPlatformLook}
      isHeaderCentered
      headerAccessory={<AuthBrandHeader platformLogoHeight={LOGIN_LOGO_HEIGHT} />}
      footer={<LoginFooter isSubmitting={isSubmitting} onSubmit={submitLogin} />}
    >
      <AuthNoticeBanner />
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <EmailTextField control={control} name="email" />
      <PasswordTextField
        control={control}
        name="password"
        label={i18n.t('auth.passwordLabel')}
        purpose="current"
      />
      <AuthLinkButton
        label={i18n.t('auth.login.forgotPasswordAction')}
        alignment="end"
        onPress={() => {
          router.push('/(auth)/forgot-password');
        }}
      />
    </ScreenTemplate>
  );
}
