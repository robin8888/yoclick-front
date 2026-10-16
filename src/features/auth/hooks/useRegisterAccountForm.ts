import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { useAccessCenter, usePendingInvitationStore } from '@/features/join';

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

// Los consentimientos nacen desmarcados y separados (SEC-23).
function buildDefaultAccountValues(): RegisterAccountFormValues {
  return {
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
 * Quién se registra no se pregunta: alumnos y equipo llegan por invitación o eligiendo su centro, y
 * quien se registra sin nada de eso va a crear su centro. El rol no se envía (la API da los roles
 * por centro): se recuerda para que, tras verificar el correo e iniciar sesión, la app abra la
 * pantalla adecuada.
 */
export function useRegisterAccountForm(): RegisterAccountForm {
  const router = useRouter();
  const saveRegistrationDraft = useAuthFlowStore((state) => state.saveRegistrationDraft);
  const rememberRole = useRememberAccountRole();
  const hasInvitationLink = usePendingInvitationStore((state) => state.invitationCode !== null);
  const accessRole = useAccessCenter()?.role;
  const { registerAccount, isRegistering, registrationErrorMessage } = useRegisterAccountRequest();
  const { control, handleSubmit } = useForm<RegisterAccountFormValues>({
    resolver: zodResolver(registerAccountFormSchema),
    defaultValues: buildDefaultAccountValues(),
  });
  // Con la invitación ya consultada manda su rol; con el enlace aún sin consultar se espera equipo.
  const selectedRole: AccountRole =
    mapInvitedRoleToAccountRole(accessRole) ?? (hasInvitationLink ? 'instructor' : 'owner');

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
