export interface WheelOption {
  /** Identifica la opción; no se repite dentro de la rueda. */
  value: string;
  /** Lo que se ve: «10», «30». */
  label: string;
  /** Lo que lee el lector de pantalla: «10 h», «10:30». */
  accessibilityLabel: string;
}

export interface WheelColumnProps {
  options: readonly WheelOption[];
  /** La opción elegida; `null` si aún no se ha elegido (la rueda enseña la primera). */
  selectedValue: string | null;
  /** Qué rueda es («Hora», «Minutos») para el lector de pantalla. */
  accessibilityLabel: string;
  onValueChange: (value: string) => void;
  /** Filas visibles a la vez (impar); 5 por defecto, 3 para rueda compacta. */
  visibleItems?: number | undefined;
}
