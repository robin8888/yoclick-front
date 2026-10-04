export interface SwitchProps {
  isOn: boolean;
  onToggle: (nextIsOn: boolean) => void;
  /** Obligatoria: el interruptor no dibuja texto; la fila que lo contiene pone el visible. */
  accessibilityLabel: string;
  isDisabled?: boolean;
}
