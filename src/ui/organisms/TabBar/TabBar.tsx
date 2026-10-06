import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createTabBarStyle, createTabItemStyle } from './TabBar.styles';
import type { TabBarProps } from './TabBar.types';

/**
 * Barra inferior de pestañas, plana y sin relleno de color. La pestaña activa solo cambia el color
 * del icono y de su texto (`brandInk`); el resto va en `ink2`. Además se marca como seleccionada
 * para el lector de pantalla, así que el estado no depende solo del color.
 */
export function TabBar({ tabs }: Readonly<TabBarProps>): React.JSX.Element {
  const theme = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <View role="tablist" style={createTabBarStyle(theme, bottomInset)}>
      {tabs.map((tab) => {
        const contentColor = tab.isActive ? 'brandInk' : 'ink2';
        return (
          <Pressable
            key={tab.id}
            role="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: tab.isActive }}
            onPress={tab.onPress}
            style={createTabItemStyle(theme)}
          >
            <Icon name={tab.iconName} size="navigation" color={contentColor} />
            <Text variant="caption" color={contentColor} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
