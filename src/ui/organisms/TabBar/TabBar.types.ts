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

/** Una pestaña de la barra de navegación de un rol (alumno, profesional o administración). */
export interface PathTab {
  id: string;
  label: string;
  iconName: IconName;
  /** A donde lleva al tocarla. */
  href: string;
  /**
   * Rutas (sin los grupos de Expo Router) que la dejan marcada: la propia y las pantallas que
   * cuelgan de ella, por ejemplo `/book` y `/book/staff`.
   */
  activePaths: readonly string[];
}

export interface PathTabBarProps {
  tabs: readonly PathTab[];
  /** La ruta actual, como la da `usePathname()`: `/home`, `/book/slot`… */
  currentPath: string;
  onTabPress: (href: string) => void;
}
