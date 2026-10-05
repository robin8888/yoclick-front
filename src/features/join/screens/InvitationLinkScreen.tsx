import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { usePendingInvitationStore } from '../model/pending-invitation-store';

const MAX_INVITATION_CODE_LENGTH = 24;
const invitationLinkParamsSchema = z.object({
  token: z.string().trim().min(1).max(MAX_INVITATION_CODE_LENGTH),
});

/**
 * `yoclick://i/{código}` y `https://yoclick.app/i/{código}`: se guarda el código y la raíz decide
 * (sin sesión, iniciar sesión o registrarse; con sesión, aceptar). El parámetro se valida con zod.
 */
export function InvitationLinkScreen(): React.JSX.Element {
  const params = invitationLinkParamsSchema.safeParse(useLocalSearchParams());
  const saveInvitationCode = usePendingInvitationStore((state) => state.saveInvitationCode);
  const invitationCode = params.success ? params.data.token : null;

  // Sincroniza el enlace con el store (sistema externo a React): no es estado derivado.
  useEffect(() => {
    if (invitationCode !== null) saveInvitationCode(invitationCode);
  }, [invitationCode, saveInvitationCode]);

  return <Redirect href="/" />;
}
