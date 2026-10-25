import { Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  createTabStyle,
  TABS_CONTENT_STYLE,
  TABS_SCROLL_STYLE,
  createTabsTrackStyle,
} from './PlatformTabs.styles';

interface PlatformTabsProps<TValue extends string> {
  options: readonly { value: TValue; label: string }[];
  selectedValue: TValue;
  onValueChange: (value: TValue) => void;
}

/**
 * Las pestañas de la zona de plataforma. Cada una es una sola línea: si no caben todas en el ancho
 * de la pantalla (o con la letra grande) la barra se desplaza en horizontal, nunca parte el texto
 * en dos filas.
 */
export function PlatformTabs<TValue extends string>({
  options,
  selectedValue,
  onValueChange,
}: Readonly<PlatformTabsProps<TValue>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View role="tablist" style={createTabsTrackStyle(theme)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={TABS_SCROLL_STYLE}
        contentContainerStyle={TABS_CONTENT_STYLE}
      >
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
              style={createTabStyle(theme, isSelected)}
            >
              <Text variant="bodyStrong" color={isSelected ? 'onBrand' : 'ink'} numberOfLines={1}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
