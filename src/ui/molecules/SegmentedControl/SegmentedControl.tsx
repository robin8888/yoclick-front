import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createSegmentStyle, createSegmentedControlStyle } from './SegmentedControl.styles';
import type { SegmentedControlProps } from './SegmentedControl.types';

/** Dos o tres opciones excluyentes en una fila (Próximas / Historial). */
export function SegmentedControl<TValue extends string>({
  options,
  selectedValue,
  onValueChange,
}: Readonly<SegmentedControlProps<TValue>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View role="tablist" style={createSegmentedControlStyle(theme)}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            role="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              onValueChange(option.value);
            }}
            style={createSegmentStyle(theme, isSelected)}
          >
            <Text variant="bodyStrong" color={isSelected ? 'onBrand' : 'ink'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
