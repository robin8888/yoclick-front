export interface CountTabOption<TValue extends string> {
  value: TValue;
  /** «Alumnos», «Grupos»: sin el número, que va aparte y en grande. */
  label: string;
  count: number;
}

export interface CountTabsProps<TValue extends string> {
  options: readonly CountTabOption<TValue>[];
  selectedValue: TValue;
  onValueChange: (value: TValue) => void;
}
