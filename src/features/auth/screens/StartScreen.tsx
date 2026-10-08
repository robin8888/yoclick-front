import { useRouter } from 'expo-router';

import { describeInvitedRole, useInvitedCenterPreview } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthBrandHeader, useHasPlatformLook } from '../components/AuthBrandHeader';
import { StartFeatureChips } from '../components/StartFeatureChips';

// Logotipo completo en blanco sobre el degradado burdeos.
const START_LOGO_HEIGHT = 240;

function useStartTexts(): { title: string; subtitle: string } {
  const invitation = useInvitedCenterPreview();
  if (invitation === undefined) {
    return { title: i18n.t('auth.start.tagline'), subtitle: i18n.t('auth.start.subtitle') };
  }
  return {
    title: i18n.t('join.invitation.startTitle', { centerName: invitation.center.name }),
    subtitle: i18n.t('join.invitation.startSubtitle', {
      roleName: describeInvitedRole(invitation),
    }),
  };
}

/** Crear cuenta, iniciar sesión y, con la marca de Yoclick, «Tengo un código». */
function StartActions({ hasCodeAction }: Readonly<{ hasCodeAction: boolean }>): React.JSX.Element {
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
      {hasCodeAction ? (
        <Button
          variant="ghost"
          label={i18n.t('join.invitation.haveCodeAction')}
          isFullWidth
          onPress={() => {
            router.push('/(auth)/code');
          }}
        />
      ) : null}
    </>
  );
}

/**
 * Primera pantalla de la app sin sesión: iniciar sesión, crear cuenta o escribir el código que
 * envió el centro. Si la persona ya trae un código (enlace), la pantalla es del centro.
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
      footer={<StartActions hasCodeAction={hasPlatformLook} />}
    >
      {hasPlatformLook ? <StartFeatureChips /> : null}
    </ScreenTemplate>
  );
}
