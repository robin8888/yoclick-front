export interface QrCardProps {
  /** Contenido que codifica el QR. */
  value: string;
  /** Qué es este QR, para el lector de pantalla («Código QR para configurar la app»). */
  accessibilityLabel: string;
  /** Lado en puntos del cuadrado del QR. */
  size?: number;
}
