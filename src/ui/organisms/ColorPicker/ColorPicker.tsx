import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { convertHexToHsv, convertHsvToHex, useTheme, type HsvColor } from '@/shared/theme';

import {
  createSurfaceStyle,
  HUE_BAR_HEIGHT,
  PICKER_STYLE,
  SQUARE_HEIGHT,
} from './ColorPicker.styles';
import type { ColorPickerProps } from './ColorPicker.types';
import { PickerThumb } from './PickerThumb';
import { useDragPosition } from './use-drag-position';

const FULL_HUE_DEGREES = 360;
const HUE_STOP_COUNT = 7;
const HUE_STOP_SEGMENTS = HUE_STOP_COUNT - 1;
const PERCENT = 100;
const GRAY_FALLBACK: HsvColor = { hue: 0, saturation: 0, value: 0.5 };
const SATURATION_STEP = 0.05;
const HUE_STEP_DEGREES = 10;

const WHITE = convertHsvToHex({ hue: 0, saturation: 0, value: 1 });
const BLACK = convertHsvToHex({ hue: 0, saturation: 0, value: 0 });
const HUE_STOPS = Array.from({ length: HUE_STOP_COUNT }, (_unused, index) => ({
  offset: `${String((index / HUE_STOP_SEGMENTS) * PERCENT)}%`,
  color: convertHsvToHex({
    hue: (index * FULL_HUE_DEGREES) / HUE_STOP_SEGMENTS,
    saturation: 1,
    value: 1,
  }),
}));

interface PickerPartProps {
  color: HsvColor;
  onColorChange: (color: HsvColor) => void;
}

/** Sin intensidad o sin brillo el tono no se lee del hexadecimal: se conserva el último arrastrado. */
function readColor(value: string, rememberedHue: number): HsvColor {
  const color = convertHexToHsv(value.toUpperCase()) ?? GRAY_FALLBACK;
  const isHueReadable = color.saturation > 0 && color.value > 0;
  return isHueReadable ? color : { ...color, hue: rememberedHue };
}

function SaturationGradient({ hueColor }: Readonly<{ hueColor: string }>): React.JSX.Element {
  return (
    <Svg width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id="saturation" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={WHITE} />
          <Stop offset="1" stopColor={hueColor} />
        </LinearGradient>
        <LinearGradient id="brightness" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BLACK} stopOpacity="0" />
          <Stop offset="1" stopColor={BLACK} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#saturation)" />
      <Rect width="100%" height="100%" fill="url(#brightness)" />
    </Svg>
  );
}

function SaturationSquare({ color, onColorChange }: Readonly<PickerPartProps>): React.JSX.Element {
  const theme = useTheme();
  const surface = useDragPosition(({ horizontal, vertical }) => {
    onColorChange({ hue: color.hue, saturation: horizontal, value: 1 - vertical });
  });
  const hueColor = convertHsvToHex({ hue: color.hue, saturation: 1, value: 1 });

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Intensidad"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        const direction = nativeEvent.actionName === 'increment' ? 1 : -1;
        const saturation = Math.min(1, Math.max(0, color.saturation + direction * SATURATION_STEP));
        onColorChange({ ...color, saturation });
      }}
      style={createSurfaceStyle(theme, SQUARE_HEIGHT)}
      {...surface.responderProps}
    >
      <SaturationGradient hueColor={hueColor} />
      <PickerThumb
        fillColor={convertHsvToHex(color)}
        horizontal={color.saturation}
        vertical={1 - color.value}
        surfaceSize={surface.size}
      />
    </View>
  );
}

function HueBar({ color, onColorChange }: Readonly<PickerPartProps>): React.JSX.Element {
  const theme = useTheme();
  const surface = useDragPosition(({ horizontal }) => {
    onColorChange({ ...color, hue: horizontal * FULL_HUE_DEGREES });
  });

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Tono"
      accessibilityValue={{ min: 0, max: FULL_HUE_DEGREES, now: Math.round(color.hue) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        const direction = nativeEvent.actionName === 'increment' ? 1 : -1;
        onColorChange({ ...color, hue: color.hue + direction * HUE_STEP_DEGREES });
      }}
      style={createSurfaceStyle(theme, HUE_BAR_HEIGHT)}
      {...surface.responderProps}
    >
      <Svg width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
            {HUE_STOPS.map((stop) => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hue)" />
      </Svg>
      <PickerThumb
        fillColor={convertHsvToHex({ hue: color.hue, saturation: 1, value: 1 })}
        horizontal={color.hue / FULL_HUE_DEGREES}
        vertical={0.5}
        surfaceSize={surface.size}
      />
    </View>
  );
}

/**
 * Selector de color como el `<input type="color">` de HTML: un cuadrado para la intensidad y el
 * brillo y una barra para el tono. Hecho con SVG y gestos de React Native, sin librería nativa.
 */
export function ColorPicker({
  value,
  onValueChange,
  accessibilityLabel,
}: Readonly<ColorPickerProps>): React.JSX.Element {
  const [rememberedHue, setRememberedHue] = useState(0);
  const color = readColor(value, rememberedHue);
  const handleColorChange = (nextColor: HsvColor): void => {
    setRememberedHue(((nextColor.hue % FULL_HUE_DEGREES) + FULL_HUE_DEGREES) % FULL_HUE_DEGREES);
    onValueChange(convertHsvToHex(nextColor));
  };

  return (
    <View accessibilityLabel={accessibilityLabel} style={PICKER_STYLE}>
      <SaturationSquare color={color} onColorChange={handleColorChange} />
      <HueBar color={color} onColorChange={handleColorChange} />
    </View>
  );
}
