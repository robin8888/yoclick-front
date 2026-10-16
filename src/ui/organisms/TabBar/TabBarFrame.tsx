import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native';

import { useIsKeyboardVisible } from '@/ui/hooks/useIsKeyboardVisible';

import { TabBarOverlapContext } from './tab-bar-overlap';

const FRAME_STYLE: ViewStyle = { flex: 1 };
const CONTENT_STYLE: ViewStyle = { flex: 1 };
const FLOATING_BAR_STYLE: ViewStyle = { position: 'absolute', left: 0, right: 0, bottom: 0 };

interface TabBarFrameProps {
  /** La barra de navegación del rol. */
  tabBar: ReactNode;
  /** Las pantallas del rol (el `Stack` del grupo). */
  children: ReactNode;
}

/**
 * La barra de navegación flota sobre todas las pantallas de un rol, no solo sobre las pestañas.
 * Como el contenido pasa por detrás (es lo que desenfoca), las plantillas leen su altura para
 * dejarle sitio abajo.
 */
export function TabBarFrame({ tabBar, children }: Readonly<TabBarFrameProps>): React.JSX.Element {
  const isKeyboardVisible = useIsKeyboardVisible();
  const [barHeight, setBarHeight] = useState(0);

  const handleBarLayout = (event: LayoutChangeEvent): void => {
    setBarHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={FRAME_STYLE}>
      <TabBarOverlapContext.Provider value={isKeyboardVisible ? 0 : barHeight}>
        <View style={CONTENT_STYLE}>{children}</View>
      </TabBarOverlapContext.Provider>
      {isKeyboardVisible ? null : (
        <View style={FLOATING_BAR_STYLE} onLayout={handleBarLayout}>
          {tabBar}
        </View>
      )}
    </View>
  );
}
