export interface ConsentCheckboxProps {
  isChecked: boolean;
  onCheckedChange: (nextIsChecked: boolean) => void;
  /** Texto del consentimiento: dice qué se acepta, sin casillas agrupadas ni marcadas de antemano. */
  label: string;
  errorMessage?: string | undefined;
}
