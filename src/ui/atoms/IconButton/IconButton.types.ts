import type { IconName } from '../Icon';

export type IconButtonVariant = 'plain' | 'tonal' | 'brand';

export interface IconButtonProps {
  iconName: IconName;
  /** Obligatoria: un botón sin texto visible solo existe para el lector de pantalla por esta etiqueta. */
  accessibilityLabel: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  isDisabled?: boolean;
}
