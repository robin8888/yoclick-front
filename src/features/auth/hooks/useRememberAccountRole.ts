import { usePendingInvitationStore } from '@/features/join';
import { useCenterCreationIntentStore } from '@/features/onboarding';

import type { AccountRole } from '../schemas/auth-forms.schema';

/**
 * El «Soy…» no se envía a la API (los roles son por centro): se recuerda en memoria para que,
 * tras verificar el correo e iniciar sesión, la raíz abra la pantalla adecuada.
 */
export function useRememberAccountRole(): (accountRole: AccountRole) => void {
  const requestCenterCreation = useCenterCreationIntentStore((state) => state.startCenterCreation);
  const expectInvitation = usePendingInvitationStore((state) => state.expectInvitation);

  return (accountRole) => {
    if (accountRole === 'owner') requestCenterCreation();
    if (accountRole === 'instructor') expectInvitation();
  };
}
