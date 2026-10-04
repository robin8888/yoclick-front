export interface ScreenSkeletonProps {
  /** Lo que anuncia el lector de pantalla mientras carga («Cargando tus citas»). */
  loadingLabel: string;
  /** Filas de lista que se dibujan bajo la cabecera. */
  rowCount?: number;
  /** Solo para tests: por defecto `SKELETON_DELAY_MS`. */
  delayMs?: number;
}
