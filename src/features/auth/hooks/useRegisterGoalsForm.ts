import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';

import { useAuthFlowStore } from '../model/auth-flow-store';
import {
  registerGoalsFormSchema,
  type RegisterGoalsFormValues,
} from '../schemas/auth-forms.schema';
import { useRegisterAccountRequest } from './useRegisterAccountRequest';

interface RegisterGoalsForm {
  control: Control<RegisterGoalsFormValues>;
  submitRegistration: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  hasDraft: boolean;
}

/**
 * Paso 2 del alta de un alumno: envía la cuenta. La experiencia y los objetivos no tienen campo
 * en el contrato todavía (docs/api-requests.md): se recogen para el nivel inicial pero no se envían.
 */
export function useRegisterGoalsForm(): RegisterGoalsForm {
  const registrationDraft = useAuthFlowStore((state) => state.registrationDraft);
  const clearRegistrationDraft = useAuthFlowStore((state) => state.clearRegistrationDraft);
  const { registerAccount, isRegistering, registrationErrorMessage } = useRegisterAccountRequest();
  const { control, handleSubmit } = useForm<RegisterGoalsFormValues>({
    resolver: zodResolver(registerGoalsFormSchema),
    defaultValues: { goalIds: [] },
  });

  const submitRegistration = handleSubmit(() => {
    if (registrationDraft === null) return;
    // La contraseña no se conserva ni un instante más de lo necesario. Se borra después de
    // navegar para que la pantalla no redirija al ver el borrador vacío.
    registerAccount(registrationDraft, clearRegistrationDraft);
  });

  return {
    control,
    submitRegistration: () => void submitRegistration(),
    isSubmitting: isRegistering,
    errorMessage: registrationErrorMessage,
    hasDraft: registrationDraft !== null,
  };
}
