import { useEffect } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion, useTheme } from '@/shared/theme';

import { compactTabBar, setTabBarReducedMotion } from './tab-bar-compact';
import { createTabBarMarginStyle, createTabBarStyle, getTabBarWidths } from './TabBar.styles';
import { TabBarButton } from './TabBarButton';
import { TabBarGlass } from './TabBarGlass';
import type { TabBarProps } from './TabBar.types';

/**
 * Barra inferior en píldora flotante de cristal: sin relleno, con el contenido desenfocado detrás.
 * Al bajar el scroll se estrecha y al subir vuelve a su ancho. La pestaña activa se marca como
 * seleccionada para el lector de pantalla, así que el estado no depende solo del color.
 */
export function TabBar({ tabs }: Readonly<TabBarProps>): React.JSX.Element {
  const theme = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isReducedMotionEnabled = useReducedMotion();
  const { fullWidth, compactWidth } = getTabBarWidths(theme, windowWidth);
  const barWidth = compactTabBar.interpolate({
    inputRange: [0, 1],
    outputRange: [fullWidth, compactWidth],
  });

  // El scroll que encoge la barra no es un componente: se le pasa la preferencia del sistema.
  useEffect(() => {
    setTabBarReducedMotion(isReducedMotionEnabled);
  }, [isReducedMotionEnabled]);

  return (
    <View style={createTabBarMarginStyle(theme, bottomInset)}>
      <Animated.View role="tablist" style={[createTabBarStyle(theme), { width: barWidth }]}>
        <TabBarGlass />
        {tabs.map((tab) => (
          <TabBarButton key={tab.id} tab={tab} />
        ))}
      </Animated.View>
    </View>
  );
}
