import { useRouter } from 'expo-router';

import { usePendingCenterStore } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthNoticeBanner } from '../components/AuthNoticeBanner';
import { EmailTextField } from '../components/EmailTextField';
import { LoginFooter } from '../components/LoginFooter';
import { PasswordTextField } from '../components/PasswordTextField';
import { useLoginForm } from '../hooks/useLoginForm';

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
      onBackPress={router.canGoBack() ? router.back : undefined}
      backLabel={i18n.t('actions.back')}
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
      <Button
        variant="ghost"
        label={i18n.t('auth.login.forgotPasswordAction')}
        onPress={() => {
          router.push('/(auth)/forgot-password');
        }}
      />
    </ScreenTemplate>
  );
}
