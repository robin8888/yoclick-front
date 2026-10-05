import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import {
  LOGO_LOADER_CYCLE_MS,
  SPARK_DIMMED_OPACITY,
  SPARK_FADE_IN_SPAN,
  SPARK_LIGHT_UP_POINTS,
  SPARKS_FADE_OUT_END,
  SPARKS_FADE_OUT_START,
} from './LogoLoader.styles';

type SparkOpacity = Animated.AnimatedInterpolation<number> | number;

const FULL_OPACITY = 1;
const CYCLE_START = 0;
const CYCLE_END = 1;

function interpolateSpark(progress: Animated.Value, lightUpPoint: number): SparkOpacity {
  return progress.interpolate({
    inputRange: [
      CYCLE_START,
      lightUpPoint,
      lightUpPoint + SPARK_FADE_IN_SPAN,
      SPARKS_FADE_OUT_START,
      SPARKS_FADE_OUT_END,
      CYCLE_END,
    ],
    outputRange: [
      SPARK_DIMMED_OPACITY,
      SPARK_DIMMED_OPACITY,
      FULL_OPACITY,
      FULL_OPACITY,
      SPARK_DIMMED_OPACITY,
      SPARK_DIMMED_OPACITY,
    ],
  });
}

/**
 * Opacidad de cada destello del logotipo: se encienden uno tras otro y se apagan juntos, en
 * bucle. Con «reducir movimiento» quedan los tres encendidos y quietos.
 */
export function useSparkOpacities(isStill: boolean): readonly SparkOpacity[] {
  const [progress] = useState(() => new Animated.Value(CYCLE_START));
  const [animatedOpacities] = useState(() =>
    SPARK_LIGHT_UP_POINTS.map((lightUpPoint) => interpolateSpark(progress, lightUpPoint)),
  );

  // Sincroniza con el sistema de animación nativo; el bucle se detiene al desmontar.
  useEffect(() => {
    if (isStill) return undefined;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: CYCLE_END,
        duration: LOGO_LOADER_CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      progress.setValue(CYCLE_START);
    };
  }, [isStill, progress]);

  return isStill ? SPARK_LIGHT_UP_POINTS.map(() => FULL_OPACITY) : animatedOpacities;
}
