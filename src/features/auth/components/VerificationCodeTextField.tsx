import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { i18n } from '@/shared/i18n';

import { VerificationCodeBoxes } from './VerificationCodeBoxes';

interface VerificationCodeTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  onSubmitEditing: () => void;
}

/** Código de 6 dígitos en casillas: teclado numérico y relleno automático desde el correo. */
export function VerificationCodeTextField<TFieldValues extends FieldValues>({
  control,
  name,
  onSubmitEditing,
}: Readonly<VerificationCodeTextFieldProps<TFieldValues>>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <VerificationCodeBoxes
          value={typeof field.value === 'string' ? field.value : ''}
          accessibilityLabel={i18n.t('auth.verificationCodeLabel')}
          errorMessage={fieldState.error?.message}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          onSubmitEditing={onSubmitEditing}
        />
      )}
    />
  );
}
