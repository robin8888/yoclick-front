import type { Control, FieldValues, Path } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

const VERIFICATION_CODE_LENGTH = 6;

interface VerificationCodeTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  onSubmitEditing: () => void;
}

/** Código de 6 dígitos: teclado numérico y relleno automático desde el SMS o el correo. */
export function VerificationCodeTextField<TFieldValues extends FieldValues>({
  control,
  name,
  onSubmitEditing,
}: Readonly<VerificationCodeTextFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <FormTextField
      control={control}
      name={name}
      label={i18n.t('auth.verificationCodeLabel')}
      keyboardType="number-pad"
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      maxLength={VERIFICATION_CODE_LENGTH}
      onSubmitEditing={onSubmitEditing}
    />
  );
}
