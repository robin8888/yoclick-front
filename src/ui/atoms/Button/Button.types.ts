import type { IconName } from '../Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Verbo en infinitivo: «Reservar cita», «Guardar cambios». */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mientras carga se ignoran las pulsaciones y el lector de pantalla lo anuncia como ocupado. */
  isLoading?: boolean;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  leadingIconName?: IconName;
  /** Solo si el texto visible no basta para el lector de pantalla (p. ej. incluir el importe). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
