import { Redirect } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { IconBadge } from '@/ui/atoms/IconBadge';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ResendCodeAction } from '../components/ResendCodeAction';
import { VerificationCodeTextField } from '../components/VerificationCodeTextField';
import { useVerifyEmailForm } from '../hooks/useVerifyEmailForm';

/** Verificación del correo con un código de 6 dígitos (5 intentos, 15 minutos). */
export function VerifyEmailScreen(): React.JSX.Element {
  const form = useVerifyEmailForm();

  // Sin correo pendiente (p. ej. la app se reinició) no hay nada que verificar aquí.
  if (form.email === null) return <Redirect href="/(auth)/login" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<IconBadge iconName="mail" />}
      isLoading={form.isSubmitting || form.isResending}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('auth.verifyEmail.title')}
      subtitle={i18n.t('auth.verifyEmail.subtitle', { email: form.email })}
      footer={
        <Button
          label={i18n.t('auth.verifyEmail.submitLabel')}
          isFullWidth
          isLoading={form.isSubmitting}
          onPress={form.submitCode}
        />
      }
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      {form.hasResent ? (
        <FormErrorBanner tone="success" message={i18n.t('auth.verifyEmail.resentNotice')} />
      ) : null}
      <VerificationCodeTextField
        control={form.control}
        name="code"
        onSubmitEditing={form.submitCode}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('auth.verifyEmail.expiryNote')}
      </Text>
      <ResendCodeAction isResending={form.isResending} onResend={form.resendCode} />
    </ScreenTemplate>
  );
}
