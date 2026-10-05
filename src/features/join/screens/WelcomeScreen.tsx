import { Redirect } from 'expo-router';

import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';
import { Avatar } from '@/ui/atoms/Avatar';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { WelcomeActions } from '../components/WelcomeActions';
import { usePendingCenterStore } from '../model/pending-center-store';

/** Prototipo `welcome`: tras elegir centro la app ya lleva su nombre y su color. */
export function WelcomeScreen(): React.JSX.Element {
  const pendingCenter = usePendingCenterStore((state) => state.pendingCenter);

  if (pendingCenter === null) return <Redirect href="/join" />;

  const { session } = getSectorVocabulary(pendingCenter.sectorId);
  return (
    <ScreenTemplate
      title={pendingCenter.name}
      subtitle={i18n.t('join.welcome.pitch', {
        sessionPlural: session.plural,
        centerName: pendingCenter.name,
      })}
      footer={<WelcomeActions />}
    >
      <Avatar
        name={pendingCenter.name}
        photoUrl={resolveApiAssetUrl(pendingCenter.logoUrl)}
        size="xl"
        isDecorative
      />
    </ScreenTemplate>
  );
}
