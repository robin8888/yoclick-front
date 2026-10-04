import type { Control, FieldValues, Path } from 'react-hook-form';

import type { FormFieldProps } from '@/ui/molecules/FormField';

export type FormTextFieldProps<TFieldValues extends FieldValues> = Omit<
  FormFieldProps,
  'value' | 'onChangeText' | 'errorMessage'
> & {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};
