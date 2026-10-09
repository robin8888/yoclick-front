import { Pressable } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createVideoTileStyle } from './Videos.styles';

interface VideoDropTileProps {
  /** Lo que se lee en el recuadro: «Sube tu vídeo de presentación», «Añadir vídeo». */
  title: string;
  /** Línea pequeña debajo (formato, duración); opcional. */
  hint?: string;
  /** Para el lector de pantalla; si no se da, es el propio título. */
  accessibilityLabel?: string;
  isCompact?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

/** El recuadro de rayas del prototipo donde se toca para elegir un vídeo. */
export function VideoDropTile({
  title,
  hint,
  accessibilityLabel,
  isCompact = false,
  isDisabled = false,
  onPress,
}: Readonly<VideoDropTileProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={createVideoTileStyle(theme, isCompact)}
    >
      <Icon name="plus" color="brandInk" />
      <Text variant={isCompact ? 'caption' : 'bodyStrong'} align="center">
        {title}
      </Text>
      {hint === undefined ? null : (
        <Text variant="caption" color="ink2" align="center">
          {hint}
        </Text>
      )}
    </Pressable>
  );
}
