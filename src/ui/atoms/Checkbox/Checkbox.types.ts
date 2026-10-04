export interface CheckboxProps {
  isChecked: boolean;
  onCheckedChange: (nextIsChecked: boolean) => void;
  /** Obligatoria: el átomo no dibuja texto; la molécula ConsentCheckbox añade el visible. */
  accessibilityLabel: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
}
