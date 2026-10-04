import type { ReactNode } from 'react';

export interface ScreenTemplateProps {
  title: string;
  subtitle?: string | undefined;
  /** Con ella aparece la flecha de volver; `backLabel` pasa a ser su texto accesible. */
  onBackPress?: (() => void) | undefined;
  backLabel?: string | undefined;
  /** Elemento sobre el título (p. ej. el logotipo en las pantallas de «Unirse»). */
  headerAccessory?: ReactNode;
  /** Zona fija bajo el contenido (la acción principal): sigue visible con el teclado abierto. */
  footer?: ReactNode;
  children: ReactNode;
}
