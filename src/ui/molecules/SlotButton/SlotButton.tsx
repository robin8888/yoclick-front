import { Pressable } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createSlotButtonStyle } from './SlotButton.styles';
import type { SlotButtonProps } from './SlotButton.types';

/** Un hueco libre. El elegido lleva una marca además del color. */
export function SlotButton({
  timeLabel,
  isSelected,
  onPress,
}: Readonly<SlotButtonProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={timeLabel}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createSlotButtonStyle(theme, isSelected)}
    >
      {isSelected ? <Icon name="check" color="onBrand" /> : null}
      <Text variant="bodyStrong" color={isSelected ? 'onBrand' : 'ink'}>
        {timeLabel}
      </Text>
    </Pressable>
  );
}
