import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createTabBarStyle, createTabItemStyle } from './TabBar.styles';
import type { TabBarProps } from './TabBar.types';

/**
 * Barra inferior de pestañas. La pestaña activa se marca con el color de marca en el icono y el
 * texto (`brandInk`) y con el estado accesible, no solo con el color.
 */
export function TabBar({ tabs }: Readonly<TabBarProps>): React.JSX.Element {
  const theme = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <View role="tablist" style={createTabBarStyle(theme, bottomInset)}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          role="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: tab.isActive }}
          onPress={tab.onPress}
          style={createTabItemStyle(theme, tab.isActive)}
        >
          <Icon name={tab.iconName} size="navigation" color={tab.isActive ? 'brandInk' : 'ink2'} />
          <Text variant="caption" color={tab.isActive ? 'brandInk' : 'ink2'}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
