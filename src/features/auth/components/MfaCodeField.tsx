import type { Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';

import type { MfaAppCodeFormValues, MfaRecoveryCodeFormValues } from '../schemas/auth-forms.schema';
import { CenteredCodeField } from './CenteredCodeField';
import { VerificationCodeTextField } from './VerificationCodeTextField';

interface MfaCodeFieldProps {
  codeKind: 'appCode' | 'recoveryCode';
  appCodeControl: Control<MfaAppCodeFormValues>;
  recoveryCodeControl: Control<MfaRecoveryCodeFormValues>;
  onSubmitEditing: () => void;
}

/** El campo del segundo factor: seis dígitos de la app o un código de recuperación. */
export function MfaCodeField({
  codeKind,
  appCodeControl,
  recoveryCodeControl,
  onSubmitEditing,
}: Readonly<MfaCodeFieldProps>): React.JSX.Element {
  if (codeKind === 'appCode') {
    return (
      <VerificationCodeTextField
        control={appCodeControl}
        name="code"
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
  return (
    <CenteredCodeField
      control={recoveryCodeControl}
      name="recoveryCode"
      label={i18n.t('auth.mfa.recoveryCodeLabel')}
      placeholder={i18n.t('auth.mfa.recoveryCodePlaceholder')}
      onSubmitEditing={onSubmitEditing}
    />
  );
}
