import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';

import {
  createContentStyle,
  createFooterStyle,
  createScreenStyle,
  TRANSPARENT_SAFE_AREA_STYLE,
  KEYBOARD_AVOIDING_STYLE,
} from './ScreenTemplate.styles';
import { PlatformHeroBackground } from './PlatformHeroBackground';
import type { ScreenTemplateProps } from './ScreenTemplate.types';
import { ScreenTemplateHeader } from './ScreenTemplateHeader';

/** Esqueleto de pantalla: zona segura, cabecera, contenido con scroll y acción fija abajo. */
export function ScreenTemplate({
  footer,
  children,
  hasPlatformHeroBackground = false,
  ...headerProps
}: Readonly<ScreenTemplateProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createScreenStyle(theme, hasPlatformHeroBackground)}>
      {hasPlatformHeroBackground && theme.mode === 'dark' ? <PlatformHeroBackground /> : null}
      <SafeAreaView style={TRANSPARENT_SAFE_AREA_STYLE}>
        <KeyboardAvoidingView
          style={KEYBOARD_AVOIDING_STYLE}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={createContentStyle(theme)}
            keyboardShouldPersistTaps="handled"
          >
            <ScreenTemplateHeader {...headerProps} />
            {children}
          </ScrollView>
          {footer === undefined ? null : <View style={createFooterStyle(theme)}>{footer}</View>}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
