import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { ListItem } from '@/ui/molecules/ListItem';

/** Las tres formas de unirse a un centro: QR, código o búsqueda. */
export function JoinStartOptions(): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <ListItem
        leadingIconName="qrCode"
        title={i18n.t('join.start.qrOptionTitle')}
        subtitle={i18n.t('join.start.qrOptionDescription')}
        onPress={() => {
          router.push('/join/scan');
        }}
      />
      <ListItem
        leadingIconName="lock"
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
    </>
  );
}
