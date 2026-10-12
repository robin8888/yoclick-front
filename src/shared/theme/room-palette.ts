import { calculateContrastRatio } from './brand-engine';

/**
 * Colores fijos para distinguir las salas en la agenda (una sala, un color, siempre el mismo).
 * Diez tonos separados entre sí; a partir de la undécima sala se repiten (la letra sigue
 * distinguiéndolas). Los hex viven aquí porque son del sistema de diseño, no de un componente.
 */
const ROOM_PALETTE = [
  '#1F6FEB',
  '#C2410C',
  '#15803D',
  '#7C3AED',
  '#BE123C',
  '#0F766E',
  '#B45309',
  '#4338CA',
  '#9D174D',
  '#374151',
] as const;

const WHITE = '#FFFFFF';
const INK = '#121416';
/** WCAG AA para texto normal. */
const MIN_READABLE_CONTRAST = 4.5;

export const ROOM_PALETTE_SIZE = ROOM_PALETTE.length;

export interface RoomPaletteColor {
  background: string;
  /** Blanco o tinta, el que contraste con el fondo. */
  text: string;
}

/** El color de la sala número `index` (0 = primera); cicla cuando hay más salas que colores. */
export function pickRoomPaletteColor(index: number): RoomPaletteColor {
  const safeIndex = ((index % ROOM_PALETTE_SIZE) + ROOM_PALETTE_SIZE) % ROOM_PALETTE_SIZE;
  const background = ROOM_PALETTE[safeIndex] ?? INK;
  const text = calculateContrastRatio(background, WHITE) >= MIN_READABLE_CONTRAST ? WHITE : INK;
  return { background, text };
}
