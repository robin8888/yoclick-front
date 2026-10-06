export interface StepProgressProps {
  /** Paso en el que está la persona, empezando en 1. */
  currentStep: number;
  stepCount: number;
  /** «Paso 1 de 3»: las barras solas no dicen nada al lector de pantalla. */
  accessibilityLabel: string;
}
