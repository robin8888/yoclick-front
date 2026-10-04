import { Controller, type FieldValues } from 'react-hook-form';

import { FormField, type FormFieldProps } from '@/ui/molecules/FormField';

import type { FormTextFieldProps } from './FormTextField.types';

/** `FormField` enlazado a react-hook-form: el error de zod sale del propio estado del campo. */
export function FormTextField<TFieldValues extends FieldValues>({
  control,
  name,
  ...fieldProps
}: Readonly<FormTextFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          {...(fieldProps as FormFieldProps)}
          value={typeof field.value === 'string' ? field.value : ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}
