import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type Control } from 'react-hook-form';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getMfaGetStatusQueryKey,
  useMfaConfirmEmail,
} from '@/shared/api/generated/endpoints/mfa/mfa';

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
  const queryClient = useQueryClient();
  const confirmMutation = useMfaConfirmEmail();
  const { control, handleSubmit } = useForm<MfaCodeFormValues>({
    resolver: zodResolver(mfaCodeFormSchema),
    defaultValues: { code: '' },
  });
  const submitCode = handleSubmit(({ code }) => {
    confirmMutation.mutate(
      { data: { code } },
      {
        onSuccess: ({ recoveryCodes }) => {
          void queryClient.invalidateQueries({ queryKey: getMfaGetStatusQueryKey() });
          onActivated(recoveryCodes);
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
