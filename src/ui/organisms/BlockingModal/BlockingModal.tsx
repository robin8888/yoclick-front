import { Modal, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createBackdropStyle,
  createCardStyle,
  createIconStyle,
  MODAL_ANCHOR_STYLE,
} from './BlockingModal.styles';
import type { BlockingModalProps } from './BlockingModal.types';

function ignoreCloseRequest(): void {
  // El botón de atrás de Android no lo cierra: solo se quita resolviendo lo que bloquea.
}

/**
 * Un aviso en el centro de la pantalla que NO se puede descartar: ni tocando fuera ni con el botón
 * de atrás. Solo tiene una acción, la que resuelve el bloqueo (por ejemplo, elegir un plan).
 */
export function BlockingModal({
  isVisible,
  title,
  message,
  actionLabel,
  onActionPress,
}: Readonly<BlockingModalProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={ignoreCloseRequest}
      accessibilityViewIsModal
    >
      <View style={MODAL_ANCHOR_STYLE}>
        <View accessible={false} style={createBackdropStyle(theme)} />
        <View style={createCardStyle(theme)} accessible role="alert">
          <View style={createIconStyle(theme)}>
            <Icon name="lock" size="navigation" color="warning" />
          </View>
          <Text variant="titleMd" align="center">
            {title}
          </Text>
          <Text color="ink2" align="center">
            {message}
          </Text>
          <Button label={actionLabel} isFullWidth onPress={onActionPress} />
        </View>
      </View>
    </Modal>
  );
}
