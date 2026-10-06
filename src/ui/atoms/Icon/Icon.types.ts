import type { ThemeColors } from '@/shared/theme';

export const ICON_NAMES = [
  'check',
  'close',
  'chevronLeft',
  'chevronRight',
  'chevronDown',
  'chevronUp',
  'arrowLeft',
  'plus',
  'minus',
  'eye',
  'eyeOff',
  'search',
  'calendar',
  'clock',
  'user',
  'users',
  'bell',
  'settings',
  'home',
  'wifiOff',
  'alertTriangle',
  'info',
  'checkCircle',
  'xCircle',
  'refresh',
  'qrCode',
  'copy',
  'logOut',
  'camera',
  'trash',
  'edit',
  'mapPin',
  'creditCard',
  'download',
  'mail',
  'lock',
  'play',
  'file',
  'palette',
  'more',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** `navigation` 22 px y `inline` 18 px salen de docs/design/sistema-de-diseno.md. */
export type IconSize = 'inline' | 'navigation' | 'large';

/** Colores de contenido permitidos: `brand` es un relleno, nunca un color de icono. */
export type IconColor = Extract<
  keyof ThemeColors,
  | 'ink'
  | 'ink2'
  | 'brandInk'
  | 'onBrand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onDanger'
  | 'info'
  | 'surface'
>;

export interface IconProps {
  name: IconName;
  size?: IconSize;
  /** Color literal que sustituye a `color`; solo para la marca de plataforma (logo). */
  tintColor?: string | undefined;
  color?: IconColor;
  /** Con etiqueta el icono se anuncia como imagen; sin ella es decorativo y se oculta. */
  accessibilityLabel?: string | undefined;
}
