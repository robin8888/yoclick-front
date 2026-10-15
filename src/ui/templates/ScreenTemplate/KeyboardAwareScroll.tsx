import { useEffect, useRef, type ReactNode } from 'react';
import {
  Keyboard,
  ScrollView,
  TextInput,
  type HostInstance,
  type NativeScrollEvent,
} from 'react-native';

import { useTheme } from '@/shared/theme';
import { calculateRevealOffset, KeyboardRevealContext } from '@/ui/hooks/keyboard-reveal';

import { createContentStyle } from './ScreenTemplate.styles';

/**
 * Tras abrirse el teclado, la plantilla aún recoloca el pie y el sistema ajusta el espacio del
 * scroll: se mide varias veces, cada una tras un nuevo ajuste, porque una sola medida temprana
 * dejaba el campo (sobre todo el último de un formulario largo) debajo del teclado.
 */
const FIRST_REVEAL_DELAY_MS = 60;
const SECOND_REVEAL_DELAY_MS = 250;
const THIRD_REVEAL_DELAY_MS = 500;
const REVEAL_DELAYS_MS = [
  FIRST_REVEAL_DELAY_MS,
  SECOND_REVEAL_DELAY_MS,
  THIRD_REVEAL_DELAY_MS,
] as const;
const SCROLL_EVENT_THROTTLE_MS = 16;

interface KeyboardAwareScrollProps {
  isContentCentered: boolean;
  /** Va tras el contenido, dentro del scroll (el botón principal mientras el teclado está abierto). */
  trailingContent?: ReactNode;
  children: ReactNode;
}

interface RevealTools {
  scrollRef: React.RefObject<ScrollView | null>;
  offsetYRef: React.RefObject<number>;
  keyboardTopYRef: React.RefObject<number | null>;
}

/** Desplaza el scroll lo justo para que el campo con el foco quede por encima del teclado. */
function revealFocusedInput({ scrollRef, offsetYRef, keyboardTopYRef }: RevealTools): void {
  const keyboardTopY = keyboardTopYRef.current;
  // Los tipos lo dan por seguro, pero sin ningún campo enfocado devuelve null.
  const focusedInput = TextInput.State.currentlyFocusedInput() as HostInstance | null;
  if (keyboardTopY === null || focusedInput === null) return;
  focusedInput.measureInWindow((...frame) => {
    const [, top, , height] = frame;
    const revealOffset = calculateRevealOffset({ inputBottomY: top + height, keyboardTopY });
    if (revealOffset === 0) return;
    scrollRef.current?.scrollTo({ y: offsetYRef.current + revealOffset, animated: true });
  });
}

/** Escucha al teclado (sistema externo): guarda dónde empieza y, al abrirse, enseña el campo enfocado. */
function useKeyboardReveal(): RevealTools & { reveal: () => void } {
  const scrollRef = useRef<ScrollView | null>(null);
  const offsetYRef = useRef(0);
  const keyboardTopYRef = useRef<number | null>(null);
  const tools = { scrollRef, offsetYRef, keyboardTopYRef };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTopYRef.current = event.endCoordinates.screenY;
      for (const delay of REVEAL_DELAYS_MS) {
        setTimeout(() => {
          revealFocusedInput({ scrollRef, offsetYRef, keyboardTopYRef });
        }, delay);
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTopYRef.current = null;
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return {
    ...tools,
    reveal: () => {
      for (const delay of REVEAL_DELAYS_MS) {
        setTimeout(() => {
          revealFocusedInput(tools);
        }, delay);
      }
    },
  };
}

/**
 * El contenido con scroll de una pantalla. iOS (`automaticallyAdjustKeyboardInsets`) y Android
 * (el `KeyboardAvoidingView` de la plantilla) dejan sitio al teclado, pero ninguno desplaza hasta
 * el campo que se escribe: eso se hace aquí, al abrirse el teclado y al cambiar de campo con él
 * abierto. Arrastrar el contenido cierra el teclado.
 */
export function KeyboardAwareScroll({
  isContentCentered,
  trailingContent,
  children,
}: Readonly<KeyboardAwareScrollProps>): React.JSX.Element {
  const theme = useTheme();
  const { scrollRef, offsetYRef, reveal } = useKeyboardReveal();

  return (
    <KeyboardRevealContext.Provider value={reveal}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={createContentStyle(theme, isContentCentered)}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
        onScroll={(event: { nativeEvent: NativeScrollEvent }) => {
          offsetYRef.current = event.nativeEvent.contentOffset.y;
        }}
      >
        {children}
        {trailingContent}
      </ScrollView>
    </KeyboardRevealContext.Provider>
  );
}
