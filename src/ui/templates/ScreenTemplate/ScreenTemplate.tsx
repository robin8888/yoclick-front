import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { platformHeroColorOverrides, ThemeProvider, useTheme } from '@/shared/theme';

import {
  createFooterStyle,
  createScreenStyle,
  TRANSPARENT_SAFE_AREA_STYLE,
  KEYBOARD_AVOIDING_STYLE,
} from './ScreenTemplate.styles';
import type { ScreenTemplateProps } from './ScreenTemplate.types';
import { BusyOverlay } from './BusyOverlay';
import { KeyboardAwareScroll } from './KeyboardAwareScroll';
import { CenterHoneycombBackground } from './CenterHoneycombBackground';
import { PlatformHeroBackground } from './PlatformHeroBackground';
import { ScreenTemplateTop } from './ScreenTemplateTop';

/** Esqueleto de pantalla: zona segura, cabecera, contenido con scroll y acción fija abajo. */
export function ScreenTemplate(props: Readonly<ScreenTemplateProps>): React.JSX.Element {
  if (!props.hasPlatformHeroBackground) return <ScreenTemplateContent {...props} />;
  // Fondo granate con texto e iconos blancos: todo lo de dentro se pinta con ese tema.
  return (
    <ThemeProvider initialPreference="dark" colorOverrides={platformHeroColorOverrides}>
      <ScreenTemplateContent {...props} />
    </ThemeProvider>
  );
}

function ScreenTemplateContent({
  footer,
  children,
  hasPlatformHeroBackground = false,
  isLoading = false,
  isContentCentered = false,
  isHeaderHidden = false,
  loadingLabel,
  ...headerProps
}: Readonly<ScreenTemplateProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createScreenStyle(theme, hasPlatformHeroBackground)}>
      {hasPlatformHeroBackground ? <PlatformHeroBackground /> : <CenterHoneycombBackground />}
      <SafeAreaView style={TRANSPARENT_SAFE_AREA_STYLE}>
        <KeyboardAvoidingView
          style={KEYBOARD_AVOIDING_STYLE}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <KeyboardAwareScroll isContentCentered={isContentCentered}>
            {isHeaderHidden ? null : (
              <ScreenTemplateTop
                hasPlatformHeroBackground={hasPlatformHeroBackground}
                {...headerProps}
              />
            )}
            {children}
          </KeyboardAwareScroll>
          {footer === undefined ? null : (
            <View style={createFooterStyle(theme, hasPlatformHeroBackground)}>{footer}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {isLoading ? <BusyOverlay loadingLabel={loadingLabel} /> : null}
    </View>
  );
}
