import { Redirect, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PasswordTextField } from '../components/PasswordTextField';
import { VerificationCodeTextField } from '../components/VerificationCodeTextField';
import { useResetPasswordForm } from '../hooks/useResetPasswordForm';

/** Prototipo `forgot`, paso 2: código del correo y contraseña nueva. */
export function ResetPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useResetPasswordForm();

  if (form.email === null) return <Redirect href="/(auth)/forgot-password" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      title={i18n.t('auth.resetPassword.title')}
      subtitle={i18n.t('auth.resetPassword.subtitle', { email: form.email })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('auth.resetPassword.submitLabel')}
          isFullWidth
          isLoading={form.isSubmitting}
          onPress={form.submitNewPassword}
        />
      }
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <VerificationCodeTextField
        control={form.control}
        name="code"
        onSubmitEditing={form.submitNewPassword}
      />
      <PasswordTextField
        control={form.control}
        name="newPassword"
        label={i18n.t('auth.resetPassword.newPasswordLabel')}
        helperText={i18n.t('auth.passwordHelper')}
        purpose="new"
      />
    </ScreenTemplate>
  );
}
