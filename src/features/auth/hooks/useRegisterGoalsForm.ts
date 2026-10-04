import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { useAuthRegister } from '@/shared/api/generated/endpoints/auth/auth';
import { getApiErrorMessage } from '@/shared/api/errors';

import { useAuthFlowStore } from '../model/auth-flow-store';
import {
  registerGoalsFormSchema,
  type RegisterGoalsFormValues,
} from '../schemas/auth-forms.schema';

interface RegisterGoalsForm {
  control: Control<RegisterGoalsFormValues>;
  submitRegistration: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  hasDraft: boolean;
}

/**
 * Paso 2 del alta: envía la cuenta. La experiencia y los objetivos no tienen campo en el
 * contrato todavía (docs/api-requests.md): se recogen para el nivel inicial pero no se envían.
 */
export function useRegisterGoalsForm(): RegisterGoalsForm {
  const router = useRouter();
  const registrationDraft = useAuthFlowStore((state) => state.registrationDraft);
  const clearRegistrationDraft = useAuthFlowStore((state) => state.clearRegistrationDraft);
  const savePendingEmail = useAuthFlowStore((state) => state.savePendingEmail);
  const registerMutation = useAuthRegister();
  const { control, handleSubmit } = useForm<RegisterGoalsFormValues>({
    resolver: zodResolver(registerGoalsFormSchema),
    defaultValues: { goalIds: [] },
  });

  const submitRegistration = handleSubmit(() => {
    if (registrationDraft === null) return;
    const { email, password, fullName, hasMarketingConsent } = registrationDraft;
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
          // La contraseña no se conserva ni un instante más de lo necesario. Se borra después de
          // navegar para que la pantalla no redirija al ver el borrador vacío.
          clearRegistrationDraft();
        },
      },
    );
  });

  return {
    control,
    submitRegistration: () => void submitRegistration(),
    isSubmitting: registerMutation.isPending,
    errorMessage: registerMutation.isError ? getApiErrorMessage(registerMutation.error) : null,
    hasDraft: registrationDraft !== null,
  };
}
