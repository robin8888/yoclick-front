import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { motionTokens } from './motion';
import { useReducedMotion } from './useReducedMotion';

/** Cada vaivén es más corto que el anterior: la campana se amortigua hasta quedarse quieta. */
const SWING_DECAY = [1, -0.8, 0.6, -0.42, 0.26, -0.13, 0.05, 0] as const;
const POP_RISE_MS = 130;
const POP_FALL_MS = 260;
const RIPPLE_COUNT = 2;

export interface BellRingAnimation {
  /** Giro de la campana, de `-ringMaxDegrees` a `+ringMaxDegrees`. */
  rotation: Animated.AnimatedInterpolation<string>;
  /** Escala del salto con que arranca el tintineo. */
  popScale: Animated.Value;
  /** Progreso de cada onda, de 0 (oculta) a 1 (expandida y desvanecida). */
  rippleProgress: readonly Animated.Value[];
}

interface RingValues {
  swing: Animated.Value;
  popScale: Animated.Value;
  rippleProgress: readonly Animated.Value[];
}

function createSwingAnimation(swing: Animated.Value): Animated.CompositeAnimation {
  return Animated.sequence(
    SWING_DECAY.map((toValue) =>
      Animated.timing(swing, {
        toValue,
        duration: motionTokens.durationRingStepMs,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ),
  );
}

function createPopAnimation(popScale: Animated.Value): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(popScale, {
      toValue: motionTokens.ringPopScale,
      duration: POP_RISE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(popScale, {
      toValue: 1,
      duration: POP_FALL_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
}

function createRippleAnimation(
  progress: Animated.Value,
  index: number,
): Animated.CompositeAnimation {
  return Animated.sequence([
    // `Animated.loop` no devuelve a 0 los valores del driver nativo al empezar otra vuelta: sin este reinicio
    // explícito la onda se quedaría en 1 (desvanecida) y solo se vería la primera vez.
    Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
    Animated.delay(index * motionTokens.rippleStaggerMs),
    Animated.timing(progress, {
      toValue: 1,
      duration: motionTokens.durationRippleMs,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
}

/** Un tintineo completo (giro, salto y ondas a la vez) y la pausa larga hasta el siguiente. */
function createRingLoop(values: RingValues): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.parallel([
        createSwingAnimation(values.swing),
        createPopAnimation(values.popScale),
        ...values.rippleProgress.map(createRippleAnimation),
      ]),
      Animated.delay(motionTokens.ringPauseMs),
    ]),
  );
}

function createRingValues(): RingValues {
  return {
    swing: new Animated.Value(0),
    popScale: new Animated.Value(1),
    rippleProgress: Array.from({ length: RIPPLE_COUNT }, () => new Animated.Value(0)),
  };
}

function resetRingValues(values: RingValues): void {
  values.swing.setValue(0);
  values.popScale.setValue(1);
  values.rippleProgress.forEach((progress) => {
    progress.setValue(0);
  });
}

/**
 * Tintineo de una campana mientras `isActive`, para avisar de que hay algo sin leer: giro que se amortigua,
 * un pequeño salto y ondas que se expanden. Con «reducir movimiento» no se mueve nada. Sincroniza con un
 * sistema externo (la animación nativa), por eso usa efecto.
 */
export function useBellRingAnimation(isActive: boolean): BellRingAnimation {
  const isReducedMotionEnabled = useReducedMotion();
  const [values] = useState(createRingValues);
  const shouldRing = isActive && !isReducedMotionEnabled;

  useEffect(() => {
    if (!shouldRing) {
      resetRingValues(values);
      return undefined;
    }
    const ring = createRingLoop(values);
    ring.start();
    return () => {
      ring.stop();
      resetRingValues(values);
    };
  }, [shouldRing, values]);

  const maxDegrees = `${String(motionTokens.ringMaxDegrees)}deg`;
  return {
    rotation: values.swing.interpolate({
      inputRange: [-1, 1],
      outputRange: [`-${maxDegrees}`, maxDegrees],
    }),
    popScale: values.popScale,
    rippleProgress: values.rippleProgress,
  };
}
