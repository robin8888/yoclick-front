import type { ReactNode } from 'react';

import type { IconName } from '@/ui/atoms/Icon';

export interface ListItemProps {
  title: string;
  subtitle?: string | undefined;
  /** Icono a la izquierda; si hace falta otra cosa (un avatar) se usa `leading`. */
  leadingIconName?: IconName;
  leading?: ReactNode;
  /** Por defecto una flecha; la fila elegida muestra una marca de verificación. */
  isSelected?: boolean;
  onPress: () => void;
  /** Solo si el título y el subtítulo no bastan para el lector de pantalla. */
  accessibilityLabel?: string;
}
