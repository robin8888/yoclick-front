import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { CenterLogoTile } from '@/ui/molecules/CenterLogoTile';
import { CenterWelcomeBackdrop, ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { WelcomeActions } from '../components/WelcomeActions';
import { usePendingCenterStore } from '../model/pending-center-store';
import { createWelcomeIdentityStyle } from './WelcomeScreen.styles';

/**
 * Prototipo `welcome`: tras elegir centro la app ya lleva su color, su logo y su nombre, sobre un
 * panel tintado con círculos de su color.
 */
export function WelcomeScreen(): React.JSX.Element {
  const theme = useTheme();
  const pendingCenter = usePendingCenterStore((state) => state.pendingCenter);

  if (pendingCenter === null) return <Redirect href="/join" />;

  const { session } = getSectorVocabulary(pendingCenter.sectorId);
  return (
    <ScreenTemplate
      title={pendingCenter.name}
      isHeaderHidden
      isContentCentered
      backdrop={<CenterWelcomeBackdrop />}
      footer={
        <WelcomeActions
          pitch={i18n.t('join.welcome.pitch', {
            sessionPlural: session.plural,
            centerName: pendingCenter.name,
          })}
        />
      }
    >
      <View style={createWelcomeIdentityStyle(theme)}>
        <CenterLogoTile
          centerName={pendingCenter.name}
          logoUrl={resolveApiAssetUrl(pendingCenter.logoUrl)}
        />
        <Text variant="display" role="heading" align="center">
          {pendingCenter.name}
        </Text>
      </View>
    </ScreenTemplate>
  );
}
