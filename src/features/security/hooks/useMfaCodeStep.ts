import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type Control } from 'react-hook-form';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getMfaGetStatusQueryKey,
  useMfaConfirmTotp,
} from '@/shared/api/generated/endpoints/mfa/mfa';

import { mfaCodeFormSchema, type MfaCodeFormValues } from '../schemas/mfa-forms.schema';

interface MfaCodeStep {
  control: Control<MfaCodeFormValues>;
  submitCode: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/** Paso 2: el primer código de la app activa el segundo factor y devuelve los códigos de recuperación. */
export function useMfaCodeStep(onActivated: (recoveryCodes: string[]) => void): MfaCodeStep {
  const queryClient = useQueryClient();
  const confirmMutation = useMfaConfirmTotp();
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
