import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, Platform, View, type ViewStyle } from 'react-native';

const FRAME_STYLE: ViewStyle = { flex: 1 };
const CONTENT_STYLE: ViewStyle = { flex: 1 };

interface TabBarFrameProps {
  /** La barra de navegación del rol. */
  tabBar: ReactNode;
  /** Las pantallas del rol (el `Stack` del grupo). */
  children: ReactNode;
}

function useIsKeyboardVisible(): boolean {
  const [isVisible, setIsVisible] = useState(false);

  // El teclado es un sistema externo: la barra se esconde mientras se escribe para dejar sitio.
  useEffect(() => {
    // En iOS se usan los eventos «will» para que la barra se esconda a la vez que sube el teclado.
    const eventPrefix = Platform.OS === 'ios' ? 'keyboardWill' : 'keyboardDid';
    const showSubscription = Keyboard.addListener(`${eventPrefix}Show`, () => {
      setIsVisible(true);
    });
    const hideSubscription = Keyboard.addListener(`${eventPrefix}Hide`, () => {
      setIsVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isVisible;
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
