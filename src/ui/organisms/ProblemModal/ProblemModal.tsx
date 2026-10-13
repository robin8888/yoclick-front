import { Modal, Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createModalBackdropStyle,
  createModalCardStyle,
  createModalIconStyle,
  MODAL_ANCHOR_STYLE,
} from './ProblemModal.styles';
import type { ProblemModalProps } from './ProblemModal.types';

/**
 * Un aviso en el centro de la pantalla que explica por qué algo no se pudo hacer (la sala ya está
 * ocupada, la persona da otra clase…). Se cierra con «Entendido» y es un diálogo: el lector de
 * pantalla lo anuncia y no deja leer lo de detrás.
 */
export function ProblemModal({
  title,
  message,
  dismissLabel,
  onDismiss,
}: Readonly<ProblemModalProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Modal
      visible={message !== null}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <View style={MODAL_ANCHOR_STYLE}>
        <Pressable accessible={false} style={createModalBackdropStyle(theme)} onPress={onDismiss} />
        <View style={createModalCardStyle(theme)} accessible role="alert">
          <View style={createModalIconStyle(theme)}>
            <Icon name="alertTriangle" size="navigation" color="warning" />
          </View>
          <Text variant="titleMd" align="center">
            {title}
          </Text>
          <Text color="ink2" align="center">
            {message}
          </Text>
          <Button label={dismissLabel} isFullWidth onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}
