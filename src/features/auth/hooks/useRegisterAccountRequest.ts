import { useRouter } from 'expo-router';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useAuthRegister } from '@/shared/api/generated/endpoints/auth/auth';

import { useAuthFlowStore } from '../model/auth-flow-store';

export interface AccountToRegister {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly hasMarketingConsent: boolean;
}

interface RegisterAccountRequest {
  registerAccount: (account: AccountToRegister, onRegistered?: () => void) => void;
  isRegistering: boolean;
  registrationErrorMessage: string | null;
}

/** Envía el alta y lleva a verificar el correo; los dos pasos de registro comparten esto. */
export function useRegisterAccountRequest(): RegisterAccountRequest {
  const router = useRouter();
  const savePendingEmail = useAuthFlowStore((state) => state.savePendingEmail);
  const registerMutation = useAuthRegister();

  function registerAccount(account: AccountToRegister, onRegistered?: () => void): void {
    const { email, password, fullName, hasMarketingConsent } = account;
    registerMutation.mutate(
      {
        data: {
          email,
          password,
          fullName,
          consents: { privacy: true, terms: true, marketing: hasMarketingConsent },
        },
      },
      {
        onSuccess: () => {
          savePendingEmail(email);
          router.replace('/(auth)/verify-email');
          onRegistered?.();
        },
      },
    );
  }

  return {
    registerAccount,
    isRegistering: registerMutation.isPending,
    registrationErrorMessage: registerMutation.isError
      ? getApiErrorMessage(registerMutation.error)
      : null,
  };
}
