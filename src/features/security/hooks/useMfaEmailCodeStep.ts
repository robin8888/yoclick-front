import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useMfaConfirmEmail } from '@/shared/api/generated/endpoints/mfa/mfa';

import { startVerifiedSession } from './useStartVerifiedSession';
import { mfaCodeFormSchema, type MfaCodeFormValues } from '../schemas/mfa-forms.schema';

interface MfaEmailCodeStep {
  control: Control<MfaCodeFormValues>;
  submitCode: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/** El código que llegó al correo activa el segundo factor y devuelve los códigos de recuperación. */
export function useMfaEmailCodeStep(
  onActivated: (recoveryCodes: string[]) => void,
): MfaEmailCodeStep {
  const confirmMutation = useMfaConfirmEmail();
  const { control, handleSubmit } = useForm<MfaCodeFormValues>({
    resolver: zodResolver(mfaCodeFormSchema),
    defaultValues: { code: '' },
  });
  const submitCode = handleSubmit(({ code }) => {
    confirmMutation.mutate(
      { data: { code } },
      {
        onSuccess: ({ recoveryCodes, session }) => {
          const showRecoveryCodes = (): void => {
            onActivated(recoveryCodes);
          };
          // Si no se pudo guardar la sesión nueva, los códigos se enseñan igualmente: se entra de nuevo.
          void startVerifiedSession(session).then(showRecoveryCodes, showRecoveryCodes);
        },
      },
    );
  });

  return {
    control,
    submitCode: () => void submitCode(),
    isSubmitting: confirmMutation.isPending,
    errorMessage: confirmMutation.isError ? getApiErrorMessage(confirmMutation.error) : null,
  };
}
