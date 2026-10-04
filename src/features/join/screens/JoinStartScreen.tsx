import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

// Tamaños del prototipo (`platMark(72)` y wordmark de 22).
const LOGO_SYMBOL_HEIGHT = 72;
const LOGO_WORDMARK_HEIGHT = 22;

/** Prototipo `jstart`. La opción «Escanear QR» (`jqr`) queda fuera hasta decidir el escáner. */
export function JoinStartScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('join.start.title')}
      subtitle={i18n.t('join.start.subtitle')}
      headerAccessory={
        <>
          <Logo variant="symbol" height={LOGO_SYMBOL_HEIGHT} />
          <Logo variant="wordmark" height={LOGO_WORDMARK_HEIGHT} />
        </>
      }
    >
      <ListItem
        leadingIconName="qrCode"
        title={i18n.t('join.start.codeOptionTitle')}
        subtitle={i18n.t('join.start.codeOptionDescription')}
        onPress={() => {
          router.push('/join/code');
        }}
      />
      <ListItem
        leadingIconName="search"
        title={i18n.t('join.start.searchOptionTitle')}
        subtitle={i18n.t('join.start.searchOptionDescription')}
        onPress={() => {
          router.push('/join/search');
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
