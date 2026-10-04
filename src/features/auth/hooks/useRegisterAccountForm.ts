import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { useAuthFlowStore } from '../model/auth-flow-store';
import {
  registerAccountFormSchema,
  type RegisterAccountFormValues,
} from '../schemas/auth-forms.schema';

interface RegisterAccountForm {
  control: Control<RegisterAccountFormValues>;
  continueToGoals: () => void;
}

/** Paso 1 del alta: guarda los datos en memoria y sigue; el alta se envía en el paso 2. */
export function useRegisterAccountForm(): RegisterAccountForm {
  const router = useRouter();
  const saveRegistrationDraft = useAuthFlowStore((state) => state.saveRegistrationDraft);
  const { control, handleSubmit } = useForm<RegisterAccountFormValues>({
    resolver: zodResolver(registerAccountFormSchema),
    // Los consentimientos nacen desmarcados y separados (SEC-23).
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      isPrivacyAccepted: false,
      isTermsAccepted: false,
      isMarketingAccepted: false,
    },
  });

  const continueToGoals = handleSubmit((account) => {
    saveRegistrationDraft({
      fullName: account.fullName,
      email: account.email,
      password: account.password,
      hasMarketingConsent: account.isMarketingAccepted,
      experience: null,
      goalIds: [],
    });
    router.push('/(auth)/register/goals');
  });

  return { control, continueToGoals: () => void continueToGoals() };
}
