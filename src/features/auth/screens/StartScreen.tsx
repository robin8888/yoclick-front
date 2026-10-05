import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { StartFeatureChips } from '../components/StartFeatureChips';

// Logotipo completo en blanco sobre el degradado burdeos.
const START_LOGO_HEIGHT = 240;

/** Primera pantalla de la app sin sesión: iniciar sesión o crear cuenta. */
export function StartScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('auth.start.tagline')}
      subtitle={i18n.t('auth.start.subtitle')}
      isHeaderCentered
      isContentCentered
      hasPlatformHeroBackground
      headerAccessory={<Logo variant="lockup" height={START_LOGO_HEIGHT} />}
      footer={
        <>
          <Button
            label={i18n.t('auth.start.registerAction')}
            isFullWidth
            onPress={() => {
              router.push('/(auth)/register');
            }}
          />
          <Button
            variant="outline"
            label={i18n.t('auth.start.loginAction')}
            isFullWidth
            onPress={() => {
              router.push('/(auth)/login');
            }}
          />
        </>
      }
    >
      <StartFeatureChips />
    </ScreenTemplate>
  );
}
