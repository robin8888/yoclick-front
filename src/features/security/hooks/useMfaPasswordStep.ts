import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useMfaSetupTotp } from '@/shared/api/generated/endpoints/mfa/mfa';
import type { MfaSetupResponseDto } from '@/shared/api/generated/model';

import { mfaPasswordFormSchema, type MfaPasswordFormValues } from '../schemas/mfa-forms.schema';

interface MfaPasswordStep {
  control: Control<MfaPasswordFormValues>;
  submitPassword: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/** Paso 1: se pide la contraseña otra vez (reautenticación) y la API devuelve la clave a configurar. */
export function useMfaPasswordStep(
  onSetupStarted: (setup: MfaSetupResponseDto) => void,
): MfaPasswordStep {
  const setupMutation = useMfaSetupTotp();
  const { control, handleSubmit } = useForm<MfaPasswordFormValues>({
    resolver: zodResolver(mfaPasswordFormSchema),
    defaultValues: { password: '' },
  });
  const submitPassword = handleSubmit(({ password }) => {
    setupMutation.mutate({ data: { password } }, { onSuccess: onSetupStarted });
  });

  return {
    control,
    submitPassword: () => void submitPassword(),
    isSubmitting: setupMutation.isPending,
    errorMessage: setupMutation.isError ? getApiErrorMessage(setupMutation.error) : null,
  };
}
