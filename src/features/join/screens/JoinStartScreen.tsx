import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { InviteLinkNotice } from '../components/InviteLinkNotice';
import { JoinStartOptions } from '../components/JoinStartOptions';
import { CENTER_SIGNUP_URL } from '../model/center-signup-url';

// Tamaños del prototipo (`platMark(72)` y wordmark de 22).
const LOGO_SYMBOL_HEIGHT = 72;
const LOGO_WORDMARK_HEIGHT = 22;

/** Prototipo `jstart`. Sin la pastilla DEMO ni el «Simular enlace», que son solo de la demo web. */
export function JoinStartScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('join.start.title')}
      subtitle={i18n.t('join.start.subtitle')}
      isHeaderCentered
      hasPlatformHeroBackground
      headerAccessory={
        <>
          <Logo variant="symbol" height={LOGO_SYMBOL_HEIGHT} />
          <Logo variant="wordmark" height={LOGO_WORDMARK_HEIGHT} />
        </>
      }
    >
      <JoinStartOptions />
      <InviteLinkNotice />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('join.start.createCenterPrompt')}
      </Text>
      <Button
        variant="ghost"
        size="sm"
        label={i18n.t('join.start.createCenterAction')}
        onPress={() => {
          void Linking.openURL(CENTER_SIGNUP_URL);
        }}
      />
      <Button
        variant="ghost"
        label={i18n.t('join.start.haveAccountAction')}
        onPress={() => {
          router.push('/(auth)/login');
        }}
      />
    </ScreenTemplate>
  );
}
