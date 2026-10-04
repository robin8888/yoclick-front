import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createGateStyle, createGateContentStyle } from './ForceUpdateGate.styles';
import type { ForceUpdateGateProps } from './ForceUpdateGate.types';

/**
 * Bloquea la app con «Actualización obligatoria» (`stupd`) cuando la API exige una versión más
 * nueva. No se puede descartar: no hay botón de cerrar y no se renderizan los hijos debajo.
 */
export function ForceUpdateGate({
  isUpdateRequired,
  title,
  message,
  updateButtonLabel,
  onUpdatePress,
  children,
}: Readonly<ForceUpdateGateProps>): React.JSX.Element {
  const theme = useTheme();
  if (!isUpdateRequired) return <>{children}</>;

  return (
    <View accessibilityViewIsModal style={createGateStyle(theme)}>
      <View style={createGateContentStyle(theme)}>
        <Icon name="download" size="large" color="brandInk" />
        <Text variant="titleLg">{title}</Text>
        <Text color="ink2">{message}</Text>
      </View>
      <Button label={updateButtonLabel} size="lg" isFullWidth onPress={onUpdatePress} />
    </View>
  );
}
