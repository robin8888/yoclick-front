import type { TimeRangeLimits } from './time-choices';

export interface TimeWheelFieldProps extends TimeRangeLimits {
  /** «De», «Hasta»: lo que se ve encima de las ruedas. */
  label: string;
  /** Contexto para el lector de pantalla: «Lunes, de». */
  accessibilityName: string;
  /** `HH:MM`. */
  time: string;
  onTimeChange: (time: string) => void;
  /** Filas visibles a la vez; 3 en listas con muchas horas (horario semanal). */
  visibleItems?: number | undefined;
}
