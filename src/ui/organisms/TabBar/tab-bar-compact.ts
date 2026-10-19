import { Animated, Easing } from 'react-native';

/** Movimiento mínimo para reaccionar: evita el temblor del dedo. */
const SCROLL_THRESHOLD_PX = 4;
/** No se encoge hasta haber bajado esto. */
const COMPACT_AFTER_PX = 40;
export const COMPACT_DURATION_MS = 280;
/** Con «reducir movimiento» el cambio es instantáneo (convención del proyecto: 1 ms). */
export const REDUCED_MOTION_DURATION_MS = 1;

/** 0 = barra a todo su ancho, 1 = barra encogida. Es de módulo: el scroll y la barra son componentes distintos. */
export const compactTabBar = new Animated.Value(0);
let lastScrollOffsetY = 0;
let currentCompactValue = 0;
let isReducedMotionEnabled = false;

export function resolveCompactDuration(input: { isReducedMotionEnabled: boolean }): number {
  return input.isReducedMotionEnabled ? REDUCED_MOTION_DURATION_MS : COMPACT_DURATION_MS;
}

/** La barra la sincroniza con la preferencia del sistema; el scroll vive fuera de React. */
export function setTabBarReducedMotion(isEnabled: boolean): void {
  isReducedMotionEnabled = isEnabled;
}

/** Bajar más de `COMPACT_AFTER_PX` la encoge; subir la devuelve a su ancho; el resto no cambia. */
export function nextCompactValue(input: {
  offsetY: number;
  lastOffsetY: number;
  current: number;
}): number {
  const { offsetY, lastOffsetY, current } = input;
  if (offsetY > lastOffsetY + SCROLL_THRESHOLD_PX && offsetY > COMPACT_AFTER_PX) return 1;
  if (offsetY < lastOffsetY - SCROLL_THRESHOLD_PX) return 0;
  return current;
}

/** Lo llama cada scroll de pantalla con su posición vertical. */
export function updateCompactTabBar(offsetY: number): void {
  const next = nextCompactValue({
    offsetY,
    lastOffsetY: lastScrollOffsetY,
    current: currentCompactValue,
  });
  if (next !== currentCompactValue) {
    currentCompactValue = next;
    // El ancho es una propiedad de diseño: no admite el motor nativo.
    Animated.timing(compactTabBar, {
      toValue: next,
      duration: resolveCompactDuration({ isReducedMotionEnabled }),
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }
  lastScrollOffsetY = offsetY;
}

/** Al cambiar de pantalla la barra vuelve a su ancho: la nueva pantalla empieza arriba del todo. */
export function resetCompactTabBar(): void {
  compactTabBar.stopAnimation();
  compactTabBar.setValue(0);
  currentCompactValue = 0;
  lastScrollOffsetY = 0;
}
