export interface ErrorStateProps {
  /** Dice qué ha pasado, sin culpar a quien lo lee («No hemos podido cargar tu agenda»). */
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
  /** Mientras se reintenta el botón queda ocupado y no admite pulsaciones repetidas. */
  isRetrying?: boolean;
  /** Texto ya formateado con el código de soporte (p. ej. el `traceId` de la API). */
  supportCodeText?: string;
}
