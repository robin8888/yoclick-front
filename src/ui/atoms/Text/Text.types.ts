import type { TextProps as NativeTextProps } from 'react-native';

import type { TypeStyleName } from '@/shared/theme';

export type TextVariant = TypeStyleName;

/** Colores de texto permitidos. `brand` queda fuera a propósito: nunca va como texto. */
export type TextColor =
  | 'ink'
  | 'ink2'
  | 'brandInk'
  | 'onBrand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onDanger'
  | 'info'
  // Solo sobre un fondo `ink` (franja «sin conexión»): `surface` es lo que contrasta con `ink`.
  | 'surface';

/** Solo las métricas grandes pueden limitar el escalado de fuente. */
export type BigMetricVariant = 'display' | 'metric';

interface BaseTextProps extends Omit<
  NativeTextProps,
  'style' | 'allowFontScaling' | 'maxFontSizeMultiplier'
> {
  color?: TextColor;
  /** `center` para titulares y mensajes de pantallas con cabecera centrada. */
  align?: 'left' | 'center';
}

interface ScalableTextProps extends BaseTextProps {
  variant?: Exclude<TextVariant, BigMetricVariant>;
  maxFontSizeMultiplier?: never;
}

interface BigMetricTextProps extends BaseTextProps {
  variant: BigMetricVariant;
  /** Tope del escalado (p. ej. 1.5) para cifras grandes que romperían la maquetación. */
  maxFontSizeMultiplier?: number;
}

export type TextProps = ScalableTextProps | BigMetricTextProps;
