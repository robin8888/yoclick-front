const MAX_CHANNEL_VALUE = 255;
const HEX_RADIX = 16;
const HEX_PAIR_LENGTH = 2;
const HUE_SECTOR_DEGREES = 60;
const FULL_CIRCLE_DEGREES = 360;
const SECTOR_COUNT = 6;
const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;
const RED_START = 1;
const GREEN_START = 3;
const BLUE_START = 5;
const GREEN_SECTOR_OFFSET = 2;
const BLUE_SECTOR_OFFSET = 4;
// Constantes de la fórmula estándar HSV → RGB: desfase de cada canal y tope de la rampa.
const RED_RAMP_OFFSET = 5;
const GREEN_RAMP_OFFSET = 3;
const BLUE_RAMP_OFFSET = 1;
const RAMP_CEILING = 4;

/** Un color como lo elige una persona: tono (0–360), intensidad y brillo (0–1). */
export interface HsvColor {
  hue: number;
  saturation: number;
  value: number;
}

function toHexPair(channelFraction: number): string {
  return Math.round(channelFraction * MAX_CHANNEL_VALUE)
    .toString(HEX_RADIX)
    .padStart(HEX_PAIR_LENGTH, '0');
}

/** `#RRGGBB` en mayúsculas a partir de tono, intensidad y brillo. */
export function convertHsvToHex({ hue, saturation, value }: HsvColor): string {
  const normalizedHue = ((hue % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;
  const channelAt = (offset: number): number => {
    const position = (offset + normalizedHue / HUE_SECTOR_DEGREES) % SECTOR_COUNT;
    const ramp = Math.max(0, Math.min(position, RAMP_CEILING - position, 1));
    return value * (1 - saturation * ramp);
  };
  const channels = [RED_RAMP_OFFSET, GREEN_RAMP_OFFSET, BLUE_RAMP_OFFSET].map((offset) =>
    toHexPair(channelAt(offset)),
  );
  return `#${channels.join('')}`.toUpperCase();
}

/** Tono, intensidad y brillo de un `#RRGGBB`; `null` si el texto no es un color completo. */
export function convertHexToHsv(hexColor: string): HsvColor | null {
  if (!HEX_COLOR_PATTERN.test(hexColor)) return null;
  const [red = 0, green = 0, blue = 0] = [RED_START, GREEN_START, BLUE_START].map(
    (start) =>
      Number.parseInt(hexColor.slice(start, start + HEX_PAIR_LENGTH), HEX_RADIX) /
      MAX_CHANNEL_VALUE,
  );
  const highest = Math.max(red, green, blue);
  const spread = highest - Math.min(red, green, blue);
  return {
    hue: spread === 0 ? 0 : resolveHue({ red, green, blue }, highest, spread),
    saturation: highest === 0 ? 0 : spread / highest,
    value: highest,
  };
}

function resolveHue(
  { red, green, blue }: { red: number; green: number; blue: number },
  highest: number,
  spread: number,
): number {
  if (highest === red)
    return (((green - blue) / spread + SECTOR_COUNT) % SECTOR_COUNT) * HUE_SECTOR_DEGREES;
  if (highest === green) return ((blue - red) / spread + GREEN_SECTOR_OFFSET) * HUE_SECTOR_DEGREES;
  return ((red - green) / spread + BLUE_SECTOR_OFFSET) * HUE_SECTOR_DEGREES;
}
