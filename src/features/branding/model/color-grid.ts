const HUE_STEP_DEGREES = 30;
const HUE_COUNT = 12;
const GRID_SATURATION_PERCENT = 70;
const DARKEST_LIGHTNESS_PERCENT = 32;
const LIGHTNESS_STEP_PERCENT = 16;
const LIGHTNESS_LEVEL_COUNT = 4;
const FULL_PERCENT = 100;
const MAX_CHANNEL_VALUE = 255;
const HEX_RADIX = 16;
const HEX_PAIR_LENGTH = 2;

// Desfases (en intervalos de 30°) de rojo, verde y azul en la fórmula estándar de CSS Color.
const RED_OFFSET = 0;
const GREEN_OFFSET = 8;
const BLUE_OFFSET = 4;
const RAMP_RISE_END = 3;
const RAMP_FALL_START = 9;

interface HslColor {
  hueDegrees: number;
  saturationPercent: number;
  lightnessPercent: number;
}

function toHexPair(channelFraction: number): string {
  return Math.round(channelFraction * MAX_CHANNEL_VALUE)
    .toString(HEX_RADIX)
    .padStart(HEX_PAIR_LENGTH, '0');
}

/** Convierte un color HSL en `#RRGGBB` en mayúsculas (fórmula estándar de CSS Color). */
export function convertHslToHex({
  hueDegrees,
  saturationPercent,
  lightnessPercent,
}: HslColor): string {
  const saturation = saturationPercent / FULL_PERCENT;
  const lightness = lightnessPercent / FULL_PERCENT;
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channelAt = (offset: number): number => {
    const position = (offset + hueDegrees / HUE_STEP_DEGREES) % HUE_COUNT;
    const ramp = Math.max(-1, Math.min(position - RAMP_RISE_END, RAMP_FALL_START - position, 1));
    return lightness - chroma * ramp;
  };
  const channels = [RED_OFFSET, GREEN_OFFSET, BLUE_OFFSET].map((offset) =>
    toHexPair(channelAt(offset)),
  );
  return `#${channels.join('')}`.toUpperCase();
}

/**
 * El «selector de color»: doce tonos del círculo cromático en cuatro luminosidades. Se lista por
 * luminosidad, de oscuro a claro.
 */
export function buildColorGrid(): string[] {
  return Array.from({ length: LIGHTNESS_LEVEL_COUNT }, (_unusedLevel, levelIndex) =>
    Array.from({ length: HUE_COUNT }, (_unusedHue, hueIndex) =>
      convertHslToHex({
        hueDegrees: hueIndex * HUE_STEP_DEGREES,
        saturationPercent: GRID_SATURATION_PERCENT,
        lightnessPercent: DARKEST_LIGHTNESS_PERCENT + levelIndex * LIGHTNESS_STEP_PERCENT,
      }),
    ),
  ).flat();
}

const WHEEL_SATURATION_PERCENT = 85;
const WHEEL_LIGHTNESS_PERCENT = 55;

/** Los doce tonos del círculo cromático a media luminosidad: lo que dibuja el icono del selector. */
export function buildHueWheelColors(): string[] {
  return Array.from({ length: HUE_COUNT }, (_unused, hueIndex) =>
    convertHslToHex({
      hueDegrees: hueIndex * HUE_STEP_DEGREES,
      saturationPercent: WHEEL_SATURATION_PERCENT,
      lightnessPercent: WHEEL_LIGHTNESS_PERCENT,
    }),
  );
}
