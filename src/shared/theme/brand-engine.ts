// Función pura (sin React) que convierte el color de un centro en tokens AA.
// Algoritmo y vectores de prueba en docs/design/brand-engine.md.
import { colorTokens } from './tokens';

export type ThemeMode = 'light' | 'dark';
type RgbChannels = readonly [red: number, green: number, blue: number];

export interface ThemeNeutrals {
  backgroundColor: string;
  surfaceColor: string;
}

export interface BrandTokens {
  /** Hex del centro tal cual: solo para rellenos, nunca como texto. */
  brand: string;
  /** '#000000' o '#FFFFFF': texto e iconos sobre `brand`. */
  onBrand: string;
  /** `brand` usado como texto o icono sobre superficie, fondo y `brandSoft`. */
  brandInk: string;
  /** Tinte de fondo. */
  brandSoft: string;
}

const MINIMUM_BRAND_INK_CONTRAST_RATIO = 4.6;
const BRAND_INK_MIX_STEP = 0.04;
const BRAND_SOFT_OPACITY_BY_MODE: Record<ThemeMode, number> = { light: 0.12, dark: 0.2 };
const BLACK_HEX = '#000000';
const WHITE_HEX = '#FFFFFF';

const MAX_CHANNEL_VALUE = 255;
const BITS_PER_CHANNEL = 8;
const HEX_RADIX = 16;
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_DIVISOR = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;
const LUMINANCE_WEIGHTS = { red: 0.2126, green: 0.7152, blue: 0.0722 } as const;
const CONTRAST_LUMINANCE_OFFSET = 0.05;

const SHORT_HEX_PATTERN = /^#?[0-9a-f]{3}$/i;
const FULL_HEX_PATTERN = /^#?[0-9a-f]{6}$/i;

/** Devuelve `#RRGGBB` en mayúsculas, o `null` si el texto no es un hex válido. */
export function normalizeHexColor(rawColor: string): string | null {
  const trimmedColor = rawColor.trim();
  const hexDigits = trimmedColor.replace('#', '');
  if (SHORT_HEX_PATTERN.test(trimmedColor)) {
    return `#${hexDigits.replaceAll(/[0-9a-f]/gi, (hexDigit) => hexDigit + hexDigit)}`.toUpperCase();
  }
  if (FULL_HEX_PATTERN.test(trimmedColor)) {
    return `#${hexDigits}`.toUpperCase();
  }
  return null;
}

function convertHexToRgbChannels(hexColor: string): RgbChannels {
  const numericColor = Number.parseInt(hexColor.slice(1), HEX_RADIX);
  const redShift = BITS_PER_CHANNEL * 2;
  return [
    (numericColor >> redShift) & MAX_CHANNEL_VALUE,
    (numericColor >> BITS_PER_CHANNEL) & MAX_CHANNEL_VALUE,
    numericColor & MAX_CHANNEL_VALUE,
  ];
}

function convertRgbChannelsToHex(rgbChannels: readonly number[]): string {
  const hexPairs = rgbChannels.map((channelValue) =>
    Math.round(channelValue).toString(HEX_RADIX).padStart(2, '0'),
  );
  return `#${hexPairs.join('').toUpperCase()}`;
}

function linearizeSrgbChannel(channelValue: number): number {
  const normalizedChannel = channelValue / MAX_CHANNEL_VALUE;
  return normalizedChannel <= SRGB_LINEAR_THRESHOLD
    ? normalizedChannel / SRGB_LINEAR_DIVISOR
    : ((normalizedChannel + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_DIVISOR) ** SRGB_GAMMA_EXPONENT;
}

function calculateRelativeLuminance(hexColor: string): number {
  const [red, green, blue] = convertHexToRgbChannels(hexColor);
  return (
    LUMINANCE_WEIGHTS.red * linearizeSrgbChannel(red) +
    LUMINANCE_WEIGHTS.green * linearizeSrgbChannel(green) +
    LUMINANCE_WEIGHTS.blue * linearizeSrgbChannel(blue)
  );
}

export function calculateContrastRatio(firstHexColor: string, secondHexColor: string): number {
  const firstLuminance = calculateRelativeLuminance(firstHexColor);
  const secondLuminance = calculateRelativeLuminance(secondHexColor);
  const lighterLuminance = Math.max(firstLuminance, secondLuminance);
  const darkerLuminance = Math.min(firstLuminance, secondLuminance);
  return (
    (lighterLuminance + CONTRAST_LUMINANCE_OFFSET) / (darkerLuminance + CONTRAST_LUMINANCE_OFFSET)
  );
}

function mixChannel(baseChannel: number, targetChannel: number, targetWeight: number): number {
  return baseChannel + (targetChannel - baseChannel) * targetWeight;
}

function mixHexColors(baseHexColor: string, targetHexColor: string, targetWeight: number): string {
  const [baseRed, baseGreen, baseBlue] = convertHexToRgbChannels(baseHexColor);
  const [targetRed, targetGreen, targetBlue] = convertHexToRgbChannels(targetHexColor);
  return convertRgbChannelsToHex([
    mixChannel(baseRed, targetRed, targetWeight),
    mixChannel(baseGreen, targetGreen, targetWeight),
    mixChannel(baseBlue, targetBlue, targetWeight),
  ]);
}

function pickReadableTextColorOnBrand(brandHexColor: string): string {
  const contrastWithBlack = calculateContrastRatio(BLACK_HEX, brandHexColor);
  const contrastWithWhite = calculateContrastRatio(WHITE_HEX, brandHexColor);
  return contrastWithBlack >= contrastWithWhite ? BLACK_HEX : WHITE_HEX;
}

interface BrandInkSearch {
  brandHexColor: string;
  themeMode: ThemeMode;
  backgroundsToPass: readonly string[];
}

function findAccessibleBrandInk({
  brandHexColor,
  themeMode,
  backgroundsToPass,
}: BrandInkSearch): string {
  const mixTargetHexColor = themeMode === 'light' ? BLACK_HEX : WHITE_HEX;
  const maximumStepCount = Math.round(1 / BRAND_INK_MIX_STEP);
  for (let stepIndex = 0; stepIndex <= maximumStepCount; stepIndex += 1) {
    const candidateInk = mixHexColors(
      brandHexColor,
      mixTargetHexColor,
      stepIndex * BRAND_INK_MIX_STEP,
    );
    const isAccessibleOnAllBackgrounds = backgroundsToPass.every(
      (backgroundHexColor) =>
        calculateContrastRatio(candidateInk, backgroundHexColor) >=
        MINIMUM_BRAND_INK_CONTRAST_RATIO,
    );
    if (isAccessibleOnAllBackgrounds) return candidateInk;
  }
  return mixTargetHexColor;
}

export function deriveBrandTokens(
  brandHexColor: string,
  themeMode: ThemeMode,
  themeNeutrals: ThemeNeutrals,
): BrandTokens {
  // Hex inválido → marca neutra (la tinta del tema), como en las pantallas «Unirse».
  const brand = normalizeHexColor(brandHexColor) ?? colorTokens[themeMode].ink;
  const brandSoft = mixHexColors(
    themeNeutrals.surfaceColor,
    brand,
    BRAND_SOFT_OPACITY_BY_MODE[themeMode],
  );
  const brandInk = findAccessibleBrandInk({
    brandHexColor: brand,
    themeMode,
    backgroundsToPass: [themeNeutrals.surfaceColor, themeNeutrals.backgroundColor, brandSoft],
  });
  return { brand, onBrand: pickReadableTextColorOnBrand(brand), brandInk, brandSoft };
}
