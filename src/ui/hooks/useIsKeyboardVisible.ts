import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** `true` mientras el teclado está abierto. En iOS se usan los eventos «will» para ir a la vez que él. */
export function useIsKeyboardVisible(): boolean {
  const [isVisible, setIsVisible] = useState(false);

  // El teclado es un sistema externo: se escuchan sus eventos y se sueltan al desmontar.
  useEffect(() => {
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
