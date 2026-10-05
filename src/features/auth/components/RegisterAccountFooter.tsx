import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { AuthLinkButton } from './AuthLinkButton';

interface RegisterAccountFooterProps {
  /** Con «alumno» el alta sigue en un segundo paso; con el resto se envía ya. */
  isLastStep: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function RegisterAccountFooter({
  isLastStep,
  isSubmitting,
  onSubmit,
}: Readonly<RegisterAccountFooterProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <Button
        label={
          isLastStep ? i18n.t('auth.register.submitLabel') : i18n.t('auth.register.continueLabel')
        }
        isFullWidth
        isLoading={isSubmitting}
        onPress={onSubmit}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('auth.register.loginPrompt')}
      </Text>
      <AuthLinkButton
        label={i18n.t('auth.register.loginAction')}
        alignment="center"
        onPress={() => {
          router.replace('/(auth)/login');
        }}
      />
    </>
  );
}
