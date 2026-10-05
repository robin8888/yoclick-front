import type { IconName } from '@/ui/atoms/Icon';

export interface TabBarItem {
  id: string;
  label: string;
  iconName: IconName;
  isActive: boolean;
  onPress: () => void;
}

export interface TabBarProps {
  tabs: readonly TabBarItem[];
}

export interface RouteTab {
  routeName: string;
  iconName: IconName;
  label: string;
}

/** Lo mínimo que se usa de las props de la barra de Expo Router (el paquete no exporta su tipo). */
export interface RouteTabBarProps {
  tabs: readonly RouteTab[];
  state: { index: number; routes: readonly { name: string }[] };
  navigation: { navigate: (routeName: string) => void };
}
