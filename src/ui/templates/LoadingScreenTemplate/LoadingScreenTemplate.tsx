import { StyleSheet, View } from 'react-native';

import { platformAccentColors, platformHeroColorOverrides, ThemeProvider } from '@/shared/theme';
import { LogoLoader } from '@/ui/atoms/LogoLoader';

import { PlatformHeroBackground } from '../ScreenTemplate/PlatformHeroBackground';
import { CENTERED_LOADER_STYLE } from './LoadingScreenTemplate.styles';

const LOADING_LOGO_HEIGHT = 96;

interface LoadingScreenTemplateProps {
  /** Texto para el lector de pantalla («Cargando»). */
  loadingLabel: string;
}

/** Pantalla completa de espera: el logotipo con sus tres destellos sobre el fondo de marca. */
export function LoadingScreenTemplate({
  loadingLabel,
}: Readonly<LoadingScreenTemplateProps>): React.JSX.Element {
  return (
    <ThemeProvider initialPreference="dark" colorOverrides={platformHeroColorOverrides}>
      <View style={StyleSheet.absoluteFill}>
        <PlatformHeroBackground />
        <View style={CENTERED_LOADER_STYLE}>
          <LogoLoader
            height={LOADING_LOGO_HEIGHT}
            tintColor={platformAccentColors.icon}
            accessibilityLabel={loadingLabel}
          />
        </View>
      </View>
    </ThemeProvider>
  );
}
