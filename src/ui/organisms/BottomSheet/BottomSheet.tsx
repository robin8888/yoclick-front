import { KeyboardAvoidingView, Modal, Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  createBackdropStyle,
  createSheetContentStyle,
  createSheetStyle,
  SHEET_ANCHOR_STYLE,
} from './BottomSheet.styles';
import type { BottomSheetProps } from './BottomSheet.types';

/**
 * Hoja inferior con título y contenido propio (selectores, formularios cortos). No sabe qué
 * contiene: quien la usa pone el contenido y sus botones.
 */
export function BottomSheet({
  isVisible,
  title,
  onDismiss,
  onClosed,
  children,
}: Readonly<BottomSheetProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      onDismiss={onClosed}
      accessibilityViewIsModal
    >
      {/* Una hoja con un campo de texto sube con el teclado; el Modal no hereda el ajuste de la ventana. */}
      <KeyboardAvoidingView style={SHEET_ANCHOR_STYLE} behavior="padding">
        <Pressable accessible={false} style={createBackdropStyle(theme)} onPress={onDismiss} />
        <View style={createSheetStyle(theme)}>
          <Text variant="titleMd">{title}</Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={createSheetContentStyle(theme)}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
