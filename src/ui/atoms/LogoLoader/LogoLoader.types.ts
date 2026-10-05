import type { IconColor } from '../Icon';

export interface LogoLoaderProps {
  /** Alto en puntos; el ancho sale de la proporción del símbolo. */
  height?: number;
  color?: Extract<IconColor, 'ink' | 'ink2' | 'brandInk' | 'onBrand'>;
  /** Color literal que sustituye a `color`; solo para la marca de plataforma (fondo burdeos). */
  tintColor?: string | undefined;
  /** Sin etiqueta el loader es decorativo (quien lo rodea ya anuncia la carga). */
  accessibilityLabel?: string | undefined;
}
