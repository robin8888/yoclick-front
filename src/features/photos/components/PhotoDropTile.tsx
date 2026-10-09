import { Pressable } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createPhotoTileStyle } from './PhotoDropTile.styles';

interface PhotoDropTileProps {
  title: string;
  isDisabled?: boolean;
  onPress: () => void;
}

/** El recuadro de rayas del prototipo donde se toca para añadir una foto. */
export function PhotoDropTile({
  title,
  isDisabled = false,
  onPress,
}: Readonly<PhotoDropTileProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={createPhotoTileStyle(theme)}
    >
      <Icon name="plus" color="brandInk" />
      <Text variant="caption" align="center">
        {title}
      </Text>
    </Pressable>
  );
}
