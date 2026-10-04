export type SpinnerColor = 'ink' | 'ink2' | 'brandInk' | 'onBrand' | 'onDanger';

export type SpinnerSize = 'small' | 'large';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  /** Sin etiqueta el spinner es decorativo (p. ej. dentro de un botón que ya anuncia «ocupado»). */
  accessibilityLabel?: string;
}
