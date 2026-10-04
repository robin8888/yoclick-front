import type { Control, FieldValues, Path } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

interface PasswordTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  helperText?: string;
  /** `new-password` deja que el gestor de contraseñas del sistema proponga una. */
  purpose: 'current' | 'new';
}

export function PasswordTextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helperText,
  purpose,
}: Readonly<PasswordTextFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <FormTextField
      control={control}
      name={name}
      label={label}
      helperText={helperText}
      isSecure
      showSecureTextLabel={i18n.t('auth.showPassword')}
      hideSecureTextLabel={i18n.t('auth.hidePassword')}
      autoCapitalize="none"
      autoComplete={purpose === 'new' ? 'new-password' : 'current-password'}
      textContentType={purpose === 'new' ? 'newPassword' : 'password'}
    />
  );
}
