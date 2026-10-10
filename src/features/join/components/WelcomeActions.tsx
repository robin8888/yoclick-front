import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

interface WelcomeActionsProps {
  /** «Reserva tus clases y sigue tu progreso en …», bajo los botones. */
  pitch: string;
}

export function WelcomeActions({ pitch }: Readonly<WelcomeActionsProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <Button
        label={i18n.t('join.welcome.createAccountAction')}
        isFullWidth
        onPress={() => {
          router.push('/(auth)/register');
        }}
      />
      <Button
        variant="outline"
        label={i18n.t('join.welcome.haveAccountAction')}
        isFullWidth
        onPress={() => {
          router.push('/(auth)/login');
        }}
      />
      <Text variant="caption" color="ink2" align="center">
        {pitch}
      </Text>
    </>
  );
}
