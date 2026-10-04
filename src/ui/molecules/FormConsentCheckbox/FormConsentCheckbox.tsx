import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { ConsentCheckbox } from '@/ui/molecules/ConsentCheckbox';

interface FormConsentCheckboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  /** Campo booleano del formulario. */
  name: Path<TFieldValues>;
  label: string;
}

/** `ConsentCheckbox` enlazado a react-hook-form: el error de zod sale del estado del campo. */
export function FormConsentCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: Readonly<FormConsentCheckboxProps<TFieldValues>>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ConsentCheckbox
          isChecked={field.value === true}
          onCheckedChange={field.onChange}
          label={label}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}
