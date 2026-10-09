import { Modal, Pressable, ScrollView, View } from 'react-native';

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
      <View style={SHEET_ANCHOR_STYLE}>
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
      </View>
    </Modal>
  );
}
