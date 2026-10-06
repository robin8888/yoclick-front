import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useIsKeyboardVisible } from '@/ui/hooks/useIsKeyboardVisible';

const FRAME_STYLE: ViewStyle = { flex: 1 };
const CONTENT_STYLE: ViewStyle = { flex: 1 };

interface TabBarFrameProps {
  /** La barra de navegación del rol. */
  tabBar: ReactNode;
  /** Las pantallas del rol (el `Stack` del grupo). */
  children: ReactNode;
}

/** La barra de navegación fija bajo todas las pantallas de un rol, no solo bajo las pestañas. */
export function TabBarFrame({ tabBar, children }: Readonly<TabBarFrameProps>): React.JSX.Element {
  const isKeyboardVisible = useIsKeyboardVisible();

  return (
    <View style={FRAME_STYLE}>
      <View style={CONTENT_STYLE}>{children}</View>
      {isKeyboardVisible ? null : tabBar}
    </View>
  );
}
