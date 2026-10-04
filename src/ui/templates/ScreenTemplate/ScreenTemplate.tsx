import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';

import {
  createContentStyle,
  createFooterStyle,
  createScreenStyle,
  KEYBOARD_AVOIDING_STYLE,
} from './ScreenTemplate.styles';
import type { ScreenTemplateProps } from './ScreenTemplate.types';
import { ScreenTemplateHeader } from './ScreenTemplateHeader';

/** Esqueleto de pantalla: zona segura, cabecera, contenido con scroll y acción fija abajo. */
export function ScreenTemplate({
  footer,
  children,
  ...headerProps
}: Readonly<ScreenTemplateProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <SafeAreaView style={createScreenStyle(theme)}>
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
  );
}
