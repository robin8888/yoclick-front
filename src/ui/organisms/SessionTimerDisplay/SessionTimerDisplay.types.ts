export interface SessionTimerDisplayProps {
  /** Tiempo grande ya formateado: «12:07». Con tiempo extra, el que se ha pasado. */
  mainTimeLabel: string;
  /** Qué significa el tiempo grande: «Restante» o «Tiempo extra». */
  mainTimeCaption: string;
  /** Texto secundario: «Transcurrido 47:53 de 60:00». */
  detailLabel: string;
  /** De 0 a 1: barra de progreso de la duración prevista. */
  progressFraction: number;
  isOvertime: boolean;
}
