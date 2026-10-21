import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { addressValueSchema, EMPTY_ADDRESS } from '../model/address-value';
import { AddressField, type AddressFieldProps } from './AddressField';

type FormAddressFieldProps<TFieldValues extends FieldValues> = Omit<
  AddressFieldProps,
  'value' | 'onChange' | 'errorMessage'
> & {
  control: Control<TFieldValues>;
  /** El campo del formulario guarda el texto y las coordenadas juntos (`AddressValue`). */
  name: Path<TFieldValues>;
};

/** `AddressField` enlazado a react-hook-form: el error de zod sale del estado del campo. */
export function FormAddressField<TFieldValues extends FieldValues>({
  control,
  name,
  ...fieldProps
}: Readonly<FormAddressFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const parsedValue = addressValueSchema.safeParse(field.value);
        return (
          <AddressField
            {...fieldProps}
            value={parsedValue.success ? parsedValue.data : EMPTY_ADDRESS}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        );
      }}
    />
  );
}
