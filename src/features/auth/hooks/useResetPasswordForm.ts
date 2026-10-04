import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { useAuthResetPassword } from '@/shared/api/generated/endpoints/auth/auth';
import { getApiErrorMessage } from '@/shared/api/errors';

import { useAuthFlowStore } from '../model/auth-flow-store';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '../schemas/auth-forms.schema';

interface ResetPasswordForm {
  control: Control<ResetPasswordFormValues>;
  email: string | null;
  submitNewPassword: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/** Paso 2: con el código del correo se fija la contraseña nueva y se vuelve a iniciar sesión. */
export function useResetPasswordForm(): ResetPasswordForm {
  const router = useRouter();
  const email = useAuthFlowStore((state) => state.pendingEmail);
  const showNotice = useAuthFlowStore((state) => state.showNotice);
  const resetMutation = useAuthResetPassword();
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { code: '', newPassword: '' },
  });

  const submitNewPassword = handleSubmit(({ code, newPassword }) => {
    if (email === null) return;
    resetMutation.mutate(
      { data: { email, code, newPassword } },
      {
        onSuccess: () => {
          showNotice('passwordChanged');
          router.replace('/(auth)/login');
        },
      },
    );
  });

  return {
    control,
    email,
    submitNewPassword: () => void submitNewPassword(),
    isSubmitting: resetMutation.isPending,
    errorMessage: resetMutation.isError ? getApiErrorMessage(resetMutation.error) : null,
  };
}
