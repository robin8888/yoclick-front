import { useRouter } from 'expo-router';

import { describeAccessRole, useAccessCenter, useClearAccessCenter } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthBrandHeader, useHasPlatformLook } from '../components/AuthBrandHeader';
import { StartFeatureChips } from '../components/StartFeatureChips';

// Logotipo completo en blanco sobre el degradado burdeos.
const START_LOGO_HEIGHT = 240;

function useStartTexts(): { title: string; subtitle: string } {
  const accessCenter = useAccessCenter();
  if (accessCenter === undefined) {
    return { title: i18n.t('auth.start.tagline'), subtitle: i18n.t('auth.start.subtitle') };
  }
  return {
    title: i18n.t('join.invitation.startTitle', { centerName: accessCenter.name }),
    subtitle: i18n.t('join.invitation.startSubtitle', {
      roleName: describeAccessRole(accessCenter),
    }),
  };
}

/** Sin centro: «Tengo un código» y «Escanear el QR». Con centro: «No es mi centro» para empezar de nuevo. */
function OtherWaysIn({
  hasPlatformLook,
}: Readonly<{ hasPlatformLook: boolean }>): React.JSX.Element {
  const router = useRouter();
  const clearAccessCenter = useClearAccessCenter();

  if (!hasPlatformLook) {
    return (
      <Button
        variant="ghost"
        label={i18n.t('join.invitation.notMyCenterAction')}
        isFullWidth
        onPress={clearAccessCenter}
      />
    );
  }
  return (
    <>
      <Button
        variant="ghost"
        label={i18n.t('join.invitation.haveCodeAction')}
        isFullWidth
        onPress={() => {
          router.push('/(auth)/code');
        }}
      />
      <Button
        variant="ghost"
        label={i18n.t('join.invitation.scanAction')}
        isFullWidth
        onPress={() => {
          router.push('/(auth)/scan');
        }}
      />
    </>
  );
}

/** Crear cuenta, iniciar sesión y las otras formas de entrar. */
function StartActions({
  hasPlatformLook,
}: Readonly<{ hasPlatformLook: boolean }>): React.JSX.Element {
  const router = useRouter();

  return (
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
      <OtherWaysIn hasPlatformLook={hasPlatformLook} />
    </>
  );
}

/**
 * Primera pantalla de la app sin sesión: iniciar sesión, crear cuenta, escribir el código del
 * centro o escanear su QR. Si la persona ya trae un centro (enlace, código o QR), la pantalla es suya.
 */
export function StartScreen(): React.JSX.Element {
  const hasPlatformLook = useHasPlatformLook();
  const texts = useStartTexts();

  return (
    <ScreenTemplate
      title={texts.title}
      subtitle={texts.subtitle}
      isHeaderCentered
      isContentCentered
      hasPlatformHeroBackground={hasPlatformLook}
      headerAccessory={<AuthBrandHeader platformLogoHeight={START_LOGO_HEIGHT} />}
      footer={<StartActions hasPlatformLook={hasPlatformLook} />}
    >
      {hasPlatformLook ? <StartFeatureChips /> : null}
    </ScreenTemplate>
  );
}
