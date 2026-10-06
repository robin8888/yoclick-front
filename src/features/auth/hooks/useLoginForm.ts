import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { getDeviceName } from '@/shared/auth/device-name';
import { useAuthLogin } from '@/shared/api/generated/endpoints/auth/auth';
import { i18n } from '@/shared/i18n';
import { getApiErrorMessage } from '@/shared/api/errors';

import { isMfaChallenge } from '../model/login-outcome';
import { useAuthFlowStore } from '../model/auth-flow-store';
import { loginFormSchema, type LoginFormValues } from '../schemas/auth-forms.schema';
import { useCompleteSignIn } from './useCompleteSignIn';

interface LoginForm {
  control: Control<LoginFormValues>;
  submitLogin: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function useLoginForm(): LoginForm {
  const router = useRouter();
  const loginMutation = useAuthLogin();
  const { completeSignIn, hasSessionStartFailed } = useCompleteSignIn();
  const saveMfaChallengeToken = useAuthFlowStore((state) => state.saveMfaChallengeToken);
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submitLogin = handleSubmit((credentials) => {
    loginMutation.mutate(
      { data: { ...credentials, deviceName: getDeviceName() } },
      {
        onSuccess: (response) => {
          if (!isMfaChallenge(response)) {
            completeSignIn(response);
            return;
          }
          saveMfaChallengeToken(response.mfaToken);
          router.push('/(auth)/mfa');
        },
      },
    );
  });

  return {
    control,
    submitLogin: () => void submitLogin(),
    isSubmitting: loginMutation.isPending,
    errorMessage: resolveErrorMessage(loginMutation.error, hasSessionStartFailed),
  };
}

function resolveErrorMessage(loginError: unknown, hasSessionStartFailed: boolean): string | null {
  if (loginError !== null) return getApiErrorMessage(loginError);
  return hasSessionStartFailed ? i18n.t('errors.UNKNOWN_ERROR') : null;
}
