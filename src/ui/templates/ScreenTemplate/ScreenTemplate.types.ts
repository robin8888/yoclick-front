import type { ReactNode } from 'react';

export interface ScreenTemplateProps {
  title: string;
  subtitle?: string | undefined;
  /** Con ella aparece la flecha de volver; `backLabel` pasa a ser su texto accesible. */
  onBackPress?: (() => void) | undefined;
  backLabel?: string | undefined;
  /** Centra título y subtítulo (pantallas de bienvenida). */
  isHeaderCentered?: boolean;
  /** Fondo con degradado burdeos de marca Yoclick con texto e iconos blancos. */
  hasPlatformHeroBackground?: boolean;
  /** Elemento sobre el título (p. ej. el logotipo en las pantallas de «Unirse»). */
  headerAccessory?: ReactNode;
  /** Zona fija bajo el contenido (la acción principal): sigue visible con el teclado abierto. */
  footer?: ReactNode;
  /** Centra en vertical la cabecera y el contenido (pantallas de bienvenida). */
  isContentCentered?: boolean;
  /** La pantalla dibuja su propia cabecera (p. ej. el inicio del alumno); `title` queda como nombre. */
  isHeaderHidden?: boolean;
  /** Botón flotante abajo a la derecha, sobre el contenido («Nueva cita»). */
  floatingAction?: ReactNode;
  /** Mientras es `true` un velo con el logotipo animado cubre la pantalla (envío en curso). */
  isLoading?: boolean;
  /** Texto del estado de carga para el lector de pantalla («Cargando»). */
  loadingLabel?: string | undefined;
  children: ReactNode;
}
