import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, useWatch, type Control } from 'react-hook-form';

import { useInvitedCenterPreview, usePendingInvitationStore } from '@/features/join';

import { useAuthFlowStore } from '../model/auth-flow-store';
import {
  registerAccountFormSchema,
  type AccountRole,
  type RegisterAccountFormValues,
} from '../schemas/auth-forms.schema';
import { useRegisterAccountRequest } from './useRegisterAccountRequest';
import { useRememberAccountRole } from './useRememberAccountRole';

interface RegisterAccountForm {
  control: Control<RegisterAccountFormValues>;
  /** Un alumno sigue al paso de experiencia; propietario e instructor envían el alta ya. */
  isLastStep: boolean;
  submitAccount: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

// Los consentimientos nacen desmarcados y separados (SEC-23). Con un enlace de invitación ya se
// sabe que la persona es instructor.
function buildDefaultAccountValues(accountRole: AccountRole): RegisterAccountFormValues {
  return {
    accountRole,
    fullName: '',
    email: '',
    password: '',
    isPrivacyAccepted: false,
    isTermsAccepted: false,
    isMarketingAccepted: false,
  };
}

/** El rol que manda la invitación: alumno sigue el camino de alumno; el resto, el de instructor. */
function mapInvitedRoleToAccountRole(invitedRole: string | undefined): AccountRole | undefined {
  if (invitedRole === undefined) return undefined;
  return invitedRole === 'client' ? 'client' : 'instructor';
}

/**
 * Alta de cuenta con «Soy…». El rol elegido no se envía: la API da los roles por centro. Solo se
 * recuerda para que, tras verificar el correo e iniciar sesión, la app abra la pantalla adecuada.
 */
export function useRegisterAccountForm(): RegisterAccountForm {
  const router = useRouter();
  const saveRegistrationDraft = useAuthFlowStore((state) => state.saveRegistrationDraft);
  const rememberRole = useRememberAccountRole();
  const hasInvitationLink = usePendingInvitationStore((state) => state.invitationCode !== null);
  const invitedRole = useInvitedCenterPreview()?.role;
  const { registerAccount, isRegistering, registrationErrorMessage } = useRegisterAccountRequest();
  const { control, handleSubmit } = useForm<RegisterAccountFormValues>({
    resolver: zodResolver(registerAccountFormSchema),
    // Los consentimientos nacen desmarcados y separados (SEC-23). Con un enlace de invitación
    // ya se sabe que la persona es instructor.
    defaultValues: buildDefaultAccountValues(hasInvitationLink ? 'instructor' : 'client'),
  });
  const formRole = useWatch({ control, name: 'accountRole' });
  // Con la invitación ya consultada manda su rol; sin consultar, lo que marque el formulario.
  const selectedRole = mapInvitedRoleToAccountRole(invitedRole) ?? formRole;

  const submitAccount = handleSubmit((account) => {
    const accountToRegister = {
      fullName: account.fullName,
      email: account.email,
      password: account.password,
      hasMarketingConsent: account.isMarketingAccepted,
    };
    rememberRole(selectedRole);
    if (selectedRole !== 'client') {
      registerAccount(accountToRegister);
      return;
    }
    saveRegistrationDraft({ ...accountToRegister, experience: null, goalIds: [] });
    router.push('/(auth)/register/goals');
  });

  return {
    control,
    isLastStep: selectedRole !== 'client',
    submitAccount: () => void submitAccount(),
    isSubmitting: isRegistering,
    errorMessage: registrationErrorMessage,
  };
}
