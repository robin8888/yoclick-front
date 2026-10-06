import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { ThemeProvider, useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ProgressRing } from '@/ui/molecules/ProgressRing';

import {
  createAppFrameStyle,
  createFullSizeAppStyle,
  createMiniCardStyle,
  createMiniHeroStyle,
  createMiniTabBarStyle,
  createMiniTabDotStyle,
  MINI_ROW_STYLE,
} from './LiveAppPreview.styles';

interface LiveAppPreviewProps {
  centerName: string;
  centerLogoUrl: string | null;
  brandHexColor: string;
}

const MINI_TAB_IDS = ['home', 'book', 'appointments', 'profile'] as const;
const MINI_WEEKLY_PROGRESS = 0.75;
const MINI_RING_SIZE = 44;

// El botón solo enseña el color: la vista previa no responde a pulsaciones.
function ignorePreviewPress(): void {
  return undefined;
}

function MiniHero(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createMiniHeroStyle(theme)}>
      <Text variant="overline" color="onBrand">
        {i18n.t('branding.preview.heroOverline')}
      </Text>
      <Text variant="titleMd" color="onBrand">
        {i18n.t('branding.preview.heroTitle')}
      </Text>
      <Text variant="caption" color="onBrand">
        {i18n.t('branding.preview.heroTime')}
      </Text>
    </View>
  );
}

function MiniShortcuts(): React.JSX.Element {
  const theme = useTheme();

  return (
    <>
      <View style={createMiniCardStyle(theme)}>
        <ProgressRing progress={MINI_WEEKLY_PROGRESS} size={MINI_RING_SIZE} accessibilityLabel="" />
        <Text variant="bodyStrong">{i18n.t('branding.preview.weeklyProgress')}</Text>
      </View>
      <View style={MINI_ROW_STYLE}>
        <View style={createMiniCardStyle(theme)}>
          <Text variant="bodyStrong" color="brandInk">
            {i18n.t('branding.preview.bookShortcut')}
          </Text>
        </View>
        <View style={createMiniCardStyle(theme)}>
          <Text variant="bodyStrong" color="brandInk">
            {i18n.t('branding.preview.appointmentsShortcut')}
          </Text>
        </View>
      </View>
    </>
  );
}

function MiniClientHome({
  centerName,
  centerLogoUrl,
}: Readonly<Omit<LiveAppPreviewProps, 'brandHexColor'>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createFullSizeAppStyle(theme)}>
      <View style={MINI_ROW_STYLE}>
        <Avatar name={centerName} photoUrl={centerLogoUrl} size="md" isDecorative />
        <Text variant="bodyStrong">{centerName}</Text>
      </View>
      <Text variant="titleLg">{i18n.t('branding.preview.greeting')}</Text>
      <MiniHero />
      <MiniShortcuts />
      <Button
        label={i18n.t('branding.preview.bookButton')}
        isFullWidth
        onPress={ignorePreviewPress}
      />
      <View style={createMiniTabBarStyle(theme)}>
        {MINI_TAB_IDS.map((tabId) => (
          <View key={tabId} style={createMiniTabDotStyle(theme, tabId === MINI_TAB_IDS[0])} />
        ))}
      </View>
    </View>
  );
}

/**
 * Prototipo `abrand`, «Vista previa en vivo»: el inicio del cliente en miniatura con el color y el
 * nombre del borrador. Es el mismo diseño real, con un tema anidado y reducido de tamaño; no es
 * interactivo ni lo lee el lector de pantalla (el contraste se lee en el informe).
 */
export function LiveAppPreview({
  centerName,
  centerLogoUrl,
  brandHexColor,
}: Readonly<LiveAppPreviewProps>): React.JSX.Element {
  const outerTheme = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={createAppFrameStyle(outerTheme)}
    >
      <ThemeProvider brandHexColor={brandHexColor} initialPreference={outerTheme.mode}>
        <MiniClientHome centerName={centerName} centerLogoUrl={centerLogoUrl} />
      </ThemeProvider>
    </View>
  );
}
