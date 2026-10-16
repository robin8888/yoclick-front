import { useEffect } from 'react';

import { isAnyPathInside } from './is-path-active';
import { resetCompactTabBar } from './tab-bar-compact';
import { TabBar } from './TabBar';
import type { PathTabBarProps } from './TabBar.types';

/** La barra de un rol: marca la pestaña cuya ruta contiene la actual y lleva a la tocada. */
export function PathTabBar({
  tabs,
  currentPath,
  onTabPress,
}: Readonly<PathTabBarProps>): React.JSX.Element {
  // La pantalla nueva empieza arriba del todo: la barra no se queda encogida de la anterior.
  useEffect(() => {
    resetCompactTabBar();
  }, [currentPath]);

  return (
    <TabBar
      tabs={tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        iconName: tab.iconName,
        isActive: isAnyPathInside(currentPath, tab.activePaths),
        badgeCount: tab.badgeCount ?? 0,
        onPress: () => {
          onTabPress(tab.href);
        },
      }))}
    />
  );
}
