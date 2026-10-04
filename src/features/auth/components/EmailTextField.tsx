import type { Control, FieldValues, Path } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

interface EmailTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
}

export function EmailTextField<TFieldValues extends FieldValues>({
  control,
  name,
}: Readonly<EmailTextFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <FormTextField
      control={control}
      name={name}
      label={i18n.t('auth.emailLabel')}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      textContentType="emailAddress"
    />
  );
}
