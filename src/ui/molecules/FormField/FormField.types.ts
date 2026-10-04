import type { InputProps } from '@/ui/atoms/Input';

type DistributiveOmit<TSource, TKey extends PropertyKey> = TSource extends unknown
  ? Omit<TSource, Extract<keyof TSource, TKey>>
  : never;

type FormFieldInputProps = DistributiveOmit<
  InputProps,
  'accessibilityLabel' | 'isInvalid' | 'invalidAccessibilityLabel'
>;

/** El `label` visible es también la etiqueta accesible del campo: nunca van por separado. */
export type FormFieldProps = FormFieldInputProps & {
  label: string;
  helperText?: string | undefined;
  /** Con error el campo se marca con borde, icono y este texto: no solo con color. */
  errorMessage?: string | undefined;
};
