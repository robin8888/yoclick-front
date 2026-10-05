import { useRouter } from 'expo-router';

import { useStartCenterCreation } from '@/features/onboarding';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { Logo } from '@/ui/atoms/Logo';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { InviteLinkNotice } from '../components/InviteLinkNotice';
import { SignedInIdentity } from '../components/SignedInIdentity';
import { JoinStartLinkButton } from '../components/JoinStartLinkButton';
import { JoinStartOptions } from '../components/JoinStartOptions';

// Logotipo completo en blanco sobre el fondo granate.
const LOGO_LOCKUP_HEIGHT = 160;

/** Prototipo `jstart`. Sin la pastilla DEMO ni el «Simular enlace», que son solo de la demo web. */
export function JoinStartScreen(): React.JSX.Element {
  const router = useRouter();
  const { startCenterCreation } = useStartCenterCreation();
  const isSignedOut = useSessionStore((state) => state.status !== 'signedIn');

  return (
    <ScreenTemplate
      title={i18n.t('join.start.title')}
      subtitle={i18n.t('join.start.subtitle')}
      isHeaderCentered
      hasPlatformHeroBackground
      headerAccessory={
        <>
          <Logo variant="lockup" height={LOGO_LOCKUP_HEIGHT} />
          <SignedInIdentity tone="platform" />
        </>
      }
    >
      <JoinStartOptions />
      <InviteLinkNotice />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('join.start.createCenterPrompt')}
      </Text>
      <JoinStartLinkButton
        label={i18n.t('join.start.createCenterAction')}
        onPress={startCenterCreation}
      />
      {isSignedOut ? (
        <JoinStartLinkButton
          label={i18n.t('join.start.haveAccountAction')}
          onPress={() => {
            router.push('/(auth)/login');
          }}
        />
      ) : null}
    </ScreenTemplate>
  );
}
