import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  View,
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
const SECOND_REVEAL_DELAY_MS = 200;
const THIRD_REVEAL_DELAY_MS = 400;
const FOURTH_REVEAL_DELAY_MS = 700;
const REVEAL_DELAYS_MS = [
  FIRST_REVEAL_DELAY_MS,
  SECOND_REVEAL_DELAY_MS,
  THIRD_REVEAL_DELAY_MS,
  FOURTH_REVEAL_DELAY_MS,
] as const;
const SCROLL_EVENT_THROTTLE_MS = 16;
const FRAME_STYLE = { flex: 1 } as const;

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

/**
 * Cuánto del scroll queda tapado por el teclado. En iOS se mide aquí (y no con
 * `automaticallyAdjustKeyboardInsets`) porque el sistema lo calcula antes de que la plantilla mueva
 * el botón fijo dentro del scroll, y el hueco salía corto: el último campo de un formulario largo no
 * se podía subir por encima del teclado.
 */
function measureKeyboardOverlap(
  frameRef: React.RefObject<View | null>,
  keyboardTopY: number,
  onMeasured: (overlap: number) => void,
): void {
  frameRef.current?.measureInWindow((...frame) => {
    const [, top, , height] = frame;
    onMeasured(Math.max(0, Math.round(top + height - keyboardTopY)));
  });
}

/** Escucha al teclado (sistema externo): guarda dónde empieza y, al abrirse, enseña el campo enfocado. */
function useKeyboardReveal(): RevealTools & {
  frameRef: React.RefObject<View | null>;
  reveal: () => void;
  keyboardOverlap: number;
} {
  const scrollRef = useRef<ScrollView | null>(null);
  // El marco del scroll se mide en esta vista que lo envuelve: `ScrollView` no expone `measureInWindow`.
  const frameRef = useRef<View | null>(null);
  const offsetYRef = useRef(0);
  const keyboardTopYRef = useRef<number | null>(null);
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);
  const tools = { scrollRef, offsetYRef, keyboardTopYRef };

  const settle = (): void => {
    const keyboardTopY = keyboardTopYRef.current;
    if (keyboardTopY !== null && Platform.OS === 'ios') {
      measureKeyboardOverlap(frameRef, keyboardTopY, setKeyboardOverlap);
    }
    revealFocusedInput(tools);
  };
  const settleSeveralTimes = (): void => {
    for (const delay of REVEAL_DELAYS_MS) setTimeout(settle, delay);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTopYRef.current = event.endCoordinates.screenY;
      settleSeveralTimes();
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTopYRef.current = null;
      setKeyboardOverlap(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
    // `settleSeveralTimes` solo usa refs y el setter: no cambia el comportamiento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...tools, frameRef, reveal: settleSeveralTimes, keyboardOverlap };
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
  const { scrollRef, frameRef, offsetYRef, reveal, keyboardOverlap } = useKeyboardReveal();

  return (
    <KeyboardRevealContext.Provider value={reveal}>
      <View ref={frameRef} style={FRAME_STYLE} collapsable={false}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            createContentStyle(theme, isContentCentered),
            // En iOS el hueco del teclado lo pone la plantilla (ver `measureKeyboardOverlap`).
            Platform.OS === 'ios' ? { paddingBottom: theme.space[5] + keyboardOverlap } : null,
          ]}
          automaticallyAdjustKeyboardInsets={false}
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
      </View>
    </KeyboardRevealContext.Provider>
  );
}
