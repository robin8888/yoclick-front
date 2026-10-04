export interface OfflineBannerProps {
  /** Lo calcula `useNetwork()` en la pantalla: la UI no consulta la red por su cuenta. */
  isOffline: boolean;
  /** Texto completo, p. ej. «Sin conexión · mostrando lo guardado a las 9:38». */
  message: string;
}
