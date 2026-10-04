import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

/** Prototipo `jstart`. La opción «Escanear QR» (`jqr`) queda fuera hasta decidir el escáner. */
export function JoinStartScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate title={i18n.t('join.start.title')} subtitle={i18n.t('join.start.subtitle')}>
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
