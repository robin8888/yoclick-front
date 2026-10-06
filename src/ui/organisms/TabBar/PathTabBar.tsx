import { isAnyPathInside } from './is-path-active';
import { TabBar } from './TabBar';
import type { PathTabBarProps } from './TabBar.types';

/** La barra de un rol: marca la pestaña cuya ruta contiene la actual y lleva a la tocada. */
export function PathTabBar({
  tabs,
  currentPath,
  onTabPress,
}: Readonly<PathTabBarProps>): React.JSX.Element {
  return (
    <TabBar
      tabs={tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        iconName: tab.iconName,
        isActive: isAnyPathInside(currentPath, tab.activePaths),
        onPress: () => {
          onTabPress(tab.href);
        },
      }))}
    />
  );
}
