import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import {
  useAuthResendEmailVerification,
  useAuthVerifyEmail,
} from '@/shared/api/generated/endpoints/auth/auth';
import { getApiErrorMessage } from '@/shared/api/errors';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { verifyEmailFormSchema, type VerifyEmailFormValues } from '../schemas/auth-forms.schema';

interface VerifyEmailForm {
  control: Control<VerifyEmailFormValues>;
  email: string | null;
  submitCode: () => void;
  resendCode: () => void;
  isSubmitting: boolean;
  isResending: boolean;
  hasResent: boolean;
  errorMessage: string | null;
}

export function useVerifyEmailForm(): VerifyEmailForm {
  const router = useRouter();
  const email = useAuthFlowStore((state) => state.pendingEmail);
  const showNotice = useAuthFlowStore((state) => state.showNotice);
  const verifyMutation = useAuthVerifyEmail();
  const resendMutation = useAuthResendEmailVerification();
  const { control, handleSubmit } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailFormSchema),
    defaultValues: { code: '' },
  });

  const submitCode = handleSubmit(({ code }) => {
    if (email === null) return;
    verifyMutation.mutate(
      { data: { email, code } },
      {
        onSuccess: () => {
          showNotice('emailVerified');
          router.replace('/(auth)/login');
        },
      },
    );
  });

  const failure = verifyMutation.error ?? resendMutation.error;
  return {
    control,
    email,
    submitCode: () => void submitCode(),
    resendCode: () => {
      if (email !== null) resendMutation.mutate({ data: { email } });
    },
    isSubmitting: verifyMutation.isPending,
    isResending: resendMutation.isPending,
    hasResent: resendMutation.isSuccess,
    errorMessage: failure === null ? null : getApiErrorMessage(failure),
  };
}
