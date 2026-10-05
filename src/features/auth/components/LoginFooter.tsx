import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { AuthLinkButton } from './AuthLinkButton';

interface LoginFooterProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function LoginFooter({
  isSubmitting,
  onSubmit,
}: Readonly<LoginFooterProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <Button
        label={i18n.t('auth.login.submitLabel')}
        isFullWidth
        isLoading={isSubmitting}
        onPress={onSubmit}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('auth.login.registerPrompt')}
      </Text>
      <AuthLinkButton
        label={i18n.t('auth.login.registerAction')}
        alignment="center"
        onPress={() => {
          router.push('/(auth)/register');
        }}
      />
    </>
  );
}
