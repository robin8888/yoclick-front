import { Modal, Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { BusyOverlay } from '@/ui/molecules/BusyOverlay';

import { createBackdropStyle, createSheetStyle, SHEET_ANCHOR_STYLE } from './ConfirmSheet.styles';
import type { ConfirmSheetProps } from './ConfirmSheet.types';

type SheetContentProps = Omit<ConfirmSheetProps, 'isVisible'>;

function SheetContent({
  title,
  message,
  confirmLabel,
  dismissLabel,
  isConfirming = false,
  isDestructive = false,
  onConfirm,
  onDismiss,
}: Readonly<SheetContentProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createSheetStyle(theme)}>
      <Text variant="titleMd" align="center">
        {title}
      </Text>
      <Text color="ink2" align="center">
        {message}
      </Text>
      <Button
        variant={isDestructive ? 'danger' : 'primary'}
        label={confirmLabel}
        isFullWidth
        isLoading={isConfirming}
        onPress={onConfirm}
      />
      <Button
        variant="ghost"
        label={dismissLabel}
        isFullWidth
        isDisabled={isConfirming}
        onPress={onDismiss}
      />
    </View>
  );
}

/**
 * Hoja inferior para confirmar una acción que no se puede deshacer. Recibe los textos y las
 * acciones por props: no sabe qué confirma.
 */
export function ConfirmSheet({
  isVisible,
  ...contentProps
}: Readonly<ConfirmSheetProps>): React.JSX.Element {
  const theme = useTheme();
  const { isConfirming = false, onDismiss } = contentProps;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <View style={SHEET_ANCHOR_STYLE}>
        <Pressable
          accessible={false}
          style={createBackdropStyle(theme)}
          onPress={isConfirming ? undefined : onDismiss}
        />
        <SheetContent {...contentProps} />
        {isConfirming ? <BusyOverlay loadingLabel={contentProps.loadingLabel} /> : null}
      </View>
    </Modal>
  );
}
