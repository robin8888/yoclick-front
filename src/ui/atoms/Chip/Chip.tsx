import { Pressable } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';
import { createChipStyle } from './Chip.styles';
import type { ChipProps } from './Chip.types';

/**
 * Opción pequeña y redonda para filtrar o marcar. El estado se dice con el icono de «marcado» y el
 * color, nunca solo con el color.
 */
export function Chip({
  label,
  isSelected,
  selectionRole = 'radio',
  accessibilityLabel,
  onPress,
}: Readonly<ChipProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole={selectionRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={createChipStyle(theme, isSelected)}
    >
      {isSelected ? <Icon name="check" color="brandInk" /> : null}
      <Text variant="caption" color={isSelected ? 'brandInk' : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );
}
