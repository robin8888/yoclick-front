import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

export function WelcomeActions(): React.JSX.Element {
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
      <Button
        variant="ghost"
        label={i18n.t('join.welcome.changeCenterAction')}
        isFullWidth
        onPress={() => {
          router.replace('/join');
        }}
      />
    </>
  );
}
