import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { useAuthForgotPassword } from '@/shared/api/generated/endpoints/auth/auth';
import { getApiErrorMessage } from '@/shared/api/errors';

import { useAuthFlowStore } from '../model/auth-flow-store';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '../schemas/auth-forms.schema';

interface ForgotPasswordForm {
  control: Control<ForgotPasswordFormValues>;
  submitEmail: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/** Paso 1 de recuperar la contraseña. La API responde igual exista o no la cuenta (SEC-46). */
export function useForgotPasswordForm(): ForgotPasswordForm {
  const router = useRouter();
  const savePendingEmail = useAuthFlowStore((state) => state.savePendingEmail);
  const forgotMutation = useAuthForgotPassword();
  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const submitEmail = handleSubmit(({ email }) => {
    forgotMutation.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          savePendingEmail(email);
          router.push('/(auth)/reset-password');
        },
      },
    );
  });

  return {
    control,
    submitEmail: () => void submitEmail(),
    isSubmitting: forgotMutation.isPending,
    errorMessage: forgotMutation.isError ? getApiErrorMessage(forgotMutation.error) : null,
  };
}
