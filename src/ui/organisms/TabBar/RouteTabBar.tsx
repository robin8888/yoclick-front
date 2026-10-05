import { TabBar } from './TabBar';
import type { RouteTabBarProps } from './TabBar.types';

/**
 * Une la navegación por pestañas (Expo Router) con la barra genérica. Cada zona de la app declara
 * sus pestañas (ruta, icono y texto) y este componente marca la activa y navega al tocar.
 */
export function RouteTabBar({
  tabs,
  state,
  navigation,
}: Readonly<RouteTabBarProps>): React.JSX.Element {
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <TabBar
      tabs={tabs.map((tab) => ({
        id: tab.routeName,
        label: tab.label,
        iconName: tab.iconName,
        isActive: tab.routeName === activeRouteName,
        onPress: () => {
          navigation.navigate(tab.routeName);
        },
      }))}
    />
  );
}
