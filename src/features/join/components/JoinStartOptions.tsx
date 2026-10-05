import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { JoinOptionCard } from './JoinOptionCard';

/** Las tres formas de unirse a un centro: QR, código o búsqueda. */
export function JoinStartOptions(): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <JoinOptionCard
        iconName="qrCode"
        title={i18n.t('join.start.qrOptionTitle')}
        description={i18n.t('join.start.qrOptionDescription')}
        onPress={() => {
          router.push('/join/scan');
        }}
      />
      <JoinOptionCard
        iconName="lock"
        title={i18n.t('join.start.codeOptionTitle')}
        description={i18n.t('join.start.codeOptionDescription')}
        onPress={() => {
          router.push('/join/code');
        }}
      />
      <JoinOptionCard
        iconName="search"
        title={i18n.t('join.start.searchOptionTitle')}
        description={i18n.t('join.start.searchOptionDescription')}
        onPress={() => {
          router.push('/join/search');
        }}
      />
    </>
  );
}
