import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { EmailTextField } from '../components/EmailTextField';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

/** Prototipo `forgot`, paso 1: el correo. */
export function ForgotPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, submitEmail, isSubmitting, errorMessage } = useForgotPasswordForm();

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      title={i18n.t('auth.forgotPassword.title')}
      subtitle={i18n.t('auth.forgotPassword.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('auth.forgotPassword.submitLabel')}
          isFullWidth
          isLoading={isSubmitting}
          onPress={submitEmail}
        />
      }
    >
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <EmailTextField control={control} name="email" />
    </ScreenTemplate>
  );
}
