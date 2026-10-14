import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useMfaSetupEmail, useMfaSetupTotp } from '@/shared/api/generated/endpoints/mfa/mfa';
import type { EmailCodeSentResponseDto, MfaSetupResponseDto } from '@/shared/api/generated/model';

import { mfaPasswordFormSchema, type MfaPasswordFormValues } from '../schemas/mfa-forms.schema';

export type MfaEnrollmentMethod = 'totp' | 'email';

interface MfaPasswordStep {
  control: Control<MfaPasswordFormValues>;
  submitPassword: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

interface MfaPasswordStepCallbacks {
  method: MfaEnrollmentMethod;
  onTotpSetupStarted: (setup: MfaSetupResponseDto) => void;
  onEmailCodeSent: (sent: EmailCodeSentResponseDto) => void;
}

/**
 * Se pide la contraseña otra vez (reautenticación). Con la app, la API devuelve la clave a
 * configurar; con el correo, envía el código al correo de la cuenta.
 */
export function useMfaPasswordStep(callbacks: MfaPasswordStepCallbacks): MfaPasswordStep {
  const totpMutation = useMfaSetupTotp();
  const emailMutation = useMfaSetupEmail();
  const { control, handleSubmit } = useForm<MfaPasswordFormValues>({
    resolver: zodResolver(mfaPasswordFormSchema),
    defaultValues: { password: '' },
  });
  const submitPassword = handleSubmit(({ password }) => {
    if (callbacks.method === 'email') {
      emailMutation.mutate({ data: { password } }, { onSuccess: callbacks.onEmailCodeSent });
      return;
    }
    totpMutation.mutate({ data: { password } }, { onSuccess: callbacks.onTotpSetupStarted });
  });
  const activeMutation = callbacks.method === 'email' ? emailMutation : totpMutation;

  return {
    control,
    submitPassword: () => void submitPassword(),
    isSubmitting: activeMutation.isPending,
    errorMessage: activeMutation.isError ? getApiErrorMessage(activeMutation.error) : null,
  };
}
