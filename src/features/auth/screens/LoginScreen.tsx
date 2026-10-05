import { useRouter } from 'expo-router';

import { usePendingCenterStore } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Logo } from '@/ui/atoms/Logo';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthLinkButton } from '../components/AuthLinkButton';
import { AuthNoticeBanner } from '../components/AuthNoticeBanner';
import { EmailTextField } from '../components/EmailTextField';
import { LoginFooter } from '../components/LoginFooter';
import { PasswordTextField } from '../components/PasswordTextField';
import { useLoginForm } from '../hooks/useLoginForm';

// Logotipo completo en blanco, más pequeño que en el inicio para dejar sitio al formulario.
const LOGIN_LOGO_HEIGHT = 110;

/** Prototipo `login`. Apple y Google quedan fuera hasta decidir el inicio de sesión social. */
export function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const centerName = usePendingCenterStore((state) => state.pendingCenter?.name);
  const { control, submitLogin, isSubmitting, errorMessage } = useLoginForm();
  const subtitle =
    centerName === undefined
      ? i18n.t('auth.login.subtitleWithoutCenter')
      : i18n.t('auth.login.subtitleWithCenter', { centerName });

  return (
    <ScreenTemplate
      title={i18n.t('auth.login.title')}
      subtitle={subtitle}
      isLoading={isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.canGoBack() ? router.back : undefined}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={LOGIN_LOGO_HEIGHT} />}
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
