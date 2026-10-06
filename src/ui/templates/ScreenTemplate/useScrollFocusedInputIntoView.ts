import { useEffect, useRef, type RefObject } from 'react';
import { Keyboard, Platform, TextInput, type ScrollView } from 'react-native';

type FocusedInput = ReturnType<typeof TextInput.State.currentlyFocusedInput>;

// Cuánto margen queda entre el borde superior de la zona visible y el campo al subirlo.
const FOCUSED_INPUT_TOP_MARGIN = 96;
// Tiempo para que el campo tocado tome el foco antes de medirlo.
const FOCUS_SETTLE_DELAY_MS = 120;

interface ScrollFocusedInputIntoView {
  scrollViewRef: RefObject<ScrollView | null>;
  /** Para el `onTouchEnd` del contenido: al tocar otro campo con el teclado ya abierto, también sube. */
  handleContentTouchEnd: () => void;
}

/**
 * Sube el campo que tiene el foco para que el teclado no lo tape. Con el teclado ya abierto el
 * contenedor se encoge, pero iOS no desplaza el contenido hasta el campo: lo medimos y lo hacemos.
 */
export function useScrollFocusedInputIntoView(): ScrollFocusedInputIntoView {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const scrollFocusedInputIntoView = (): void => {
    // Sin ningún campo con foco devuelve `null`, aunque el tipo de React Native no lo diga.
    const focusedInput = TextInput.State.currentlyFocusedInput() as FocusedInput | null;
    const scrollView = scrollViewRef.current;
    // `getInnerViewNode` está tipado como `any`: aquí es el identificador nativo del contenido.
    const contentHandle = scrollView?.getInnerViewNode() as number | undefined;
    if (!focusedInput || !scrollView || contentHandle === undefined) return;
    focusedInput.measureLayout(
      contentHandle,
      (_left, top) => {
        scrollView.scrollTo({ y: Math.max(0, top - FOCUSED_INPUT_TOP_MARGIN), animated: true });
      },
      () => undefined,
    );
  };

  // El teclado es un sistema externo: al abrirse, el campo enfocado se sube a la vista.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(showEvent, () => {
      setTimeout(scrollFocusedInputIntoView, FOCUS_SETTLE_DELAY_MS);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return {
    scrollViewRef,
    handleContentTouchEnd: () => {
      if (Keyboard.isVisible()) setTimeout(scrollFocusedInputIntoView, FOCUS_SETTLE_DELAY_MS);
    },
  };
}
