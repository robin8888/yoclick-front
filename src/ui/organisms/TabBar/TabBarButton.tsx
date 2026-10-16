import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { CountBadge } from '@/ui/atoms/CountBadge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createTabItemStyle } from './TabBar.styles';
import type { TabBarItem } from './TabBar.types';

/** Una pestaña: icono (con su aviso) y texto, en `brandInk` si está activa y en `ink2` si no. */
export function TabBarButton({ tab }: Readonly<{ tab: TabBarItem }>): React.JSX.Element {
  const theme = useTheme();
  const contentColor = tab.isActive ? 'brandInk' : 'ink2';
  const badgeCount = tab.badgeCount ?? 0;

  return (
    <Pressable
      role="tab"
      accessibilityLabel={badgeCount > 0 ? `${tab.label}, ${String(badgeCount)}` : tab.label}
      accessibilityState={{ selected: tab.isActive }}
      onPress={tab.onPress}
      style={createTabItemStyle(theme)}
    >
      <View>
        <Icon name={tab.iconName} size="navigation" color={contentColor} />
        <CountBadge count={badgeCount} />
      </View>
      <Text variant="caption" color={contentColor} numberOfLines={1}>
        {tab.label}
      </Text>
    </Pressable>
  );
}
