import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useReducedMotion, useTheme } from '@/shared/theme';

import {
  DEFAULT_LOGO_LOADER_HEIGHT,
  LOGO_ASPECT_RATIO,
  LOGO_BODY_STROKES,
  LOGO_SPARK_STROKES,
  LOGO_VIEW_BOX,
  type LogoStroke,
} from './LogoLoader.styles';
import type { LogoLoaderProps } from './LogoLoader.types';
import { useSparkOpacities } from './useSparkOpacities';

interface LogoStrokesProps {
  strokes: readonly LogoStroke[];
  strokeColor: string;
}

function LogoStrokes({ strokes, strokeColor }: Readonly<LogoStrokesProps>): React.JSX.Element {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox={LOGO_VIEW_BOX} width="100%" height="100%">
      {strokes.map((stroke) => (
        <Path
          key={stroke.path}
          d={stroke.path}
          stroke={strokeColor}
          strokeWidth={stroke.width}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}

/** Logotipo con los tres destellos encendiéndose y apagándose: la espera de la app. */
export function LogoLoader({
  height = DEFAULT_LOGO_LOADER_HEIGHT,
  color = 'brandInk',
  tintColor,
  accessibilityLabel,
}: Readonly<LogoLoaderProps>): React.JSX.Element {
  const theme = useTheme();
  const sparkOpacities = useSparkOpacities(useReducedMotion());
  const strokeColor = tintColor ?? theme.colors[color];
  const isDecorative = accessibilityLabel === undefined;

  return (
    <View
      accessible={!isDecorative}
      role={isDecorative ? undefined : 'progressbar'}
      aria-label={accessibilityLabel}
      aria-busy={!isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'auto'}
      style={{ width: height * LOGO_ASPECT_RATIO, height }}
    >
      <LogoStrokes strokes={LOGO_BODY_STROKES} strokeColor={strokeColor} />
      {LOGO_SPARK_STROKES.map((spark, sparkIndex) => (
        <Animated.View
          key={spark.path}
          style={[StyleSheet.absoluteFill, { opacity: sparkOpacities[sparkIndex] }]}
        >
          <LogoStrokes strokes={[spark]} strokeColor={strokeColor} />
        </Animated.View>
      ))}
    </View>
  );
}
