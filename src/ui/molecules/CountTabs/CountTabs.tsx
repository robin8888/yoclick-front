import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createCountTabsStyle, createCountTabStyle } from './CountTabs.styles';
import type { CountTabsProps } from './CountTabs.types';

/** El número es grande: con letra muy ampliada no debe romper la pestaña. */
const MAX_COUNT_FONT_MULTIPLIER = 1.3;

/** Pestañas con su recuento («12 · Alumnos»): se ve de un vistazo cuánto hay en cada una. */
export function CountTabs<TValue extends string>({
  options,
  selectedValue,
  onValueChange,
}: Readonly<CountTabsProps<TValue>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View role="tablist" style={createCountTabsStyle(theme)}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        const textColor = isSelected ? 'onBrand' : 'ink';
        return (
          <Pressable
            key={option.value}
            role="tab"
            accessibilityLabel={`${option.label}: ${String(option.count)}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              onValueChange(option.value);
            }}
            style={createCountTabStyle(theme, isSelected)}
          >
            <Text
              variant="metric"
              color={textColor}
              maxFontSizeMultiplier={MAX_COUNT_FONT_MULTIPLIER}
            >
              {String(option.count)}
            </Text>
            <Text variant="caption" color={isSelected ? 'onBrand' : 'ink2'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
