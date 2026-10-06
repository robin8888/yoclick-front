import { Pressable } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createDayPillStyle } from './DayPill.styles';
import type { DayPillProps } from './DayPill.types';

/** Un día del selector de fechas: día de la semana y número. */
export function DayPill({
  weekdayLabel,
  dayLabel,
  accessibilityLabel,
  isSelected,
  selectedTone = 'brand',
  hasSlots,
  onPress,
}: Readonly<DayPillProps>): React.JSX.Element {
  const theme = useTheme();
  const idleColor = hasSlots ? 'ink' : 'ink2';
  const selectedColor = selectedTone === 'ink' ? 'surface' : 'onBrand';
  const contentColor = isSelected ? selectedColor : idleColor;

  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected, disabled: !hasSlots }}
      disabled={!hasSlots}
      onPress={onPress}
      style={createDayPillStyle(theme, isSelected, selectedTone)}
    >
      <Text variant="caption" color={contentColor}>
        {weekdayLabel}
      </Text>
      <Text variant="titleMd" color={contentColor}>
        {dayLabel}
      </Text>
    </Pressable>
  );
}
