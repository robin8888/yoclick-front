import type { ReactNode } from 'react';

export interface BottomSheetProps {
  isVisible: boolean;
  title: string;
  onDismiss: () => void;
  /** Solo iOS: la hoja ya terminó de cerrarse. Hasta entonces no se puede abrir otra pantalla modal. */
  onClosed?: () => void;
  children: ReactNode;
}
