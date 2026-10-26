import { useEffect, useRef } from 'react';

import { usePendingInvitationStore } from '../model/pending-invitation-store';
import { useInvitationAcceptance } from './useInvitationAcceptance';

interface PendingInvitationAcceptance {
  /** Se está aceptando sola: la persona no necesita ver la pantalla de invitación. */
  isAccepting: boolean;
}

/**
 * La invitación que llegó antes de registrarse o iniciar sesión se acepta nada más tener sesión,
 * sin pasar por la pantalla de invitación. Si falla, `isAccepting` baja a `false` y esa pantalla
 * enseña el motivo y deja reintentar.
 */
export function useAcceptPendingInvitation(isSignedIn: boolean): PendingInvitationAcceptance {
  const savedCode = usePendingInvitationStore((state) => state.invitationCode);
  const isAutoAcceptAllowed = usePendingInvitationStore((state) => state.isAutoAcceptAllowed);
  const invitationCode = isSignedIn && isAutoAcceptAllowed ? savedCode : null;
  const lastAcceptedCode = useRef<string | null>(null);
  const acceptance = useInvitationAcceptance({
    invitationCode,
    // Al aceptar se vacía el almacén y la puerta de entrada sigue sola hacia su zona.
    onAccepted: () => undefined,
  });
  const { acceptInvitation, preview } = acceptance;

  // Aceptar es sincronizar con el servidor, y una sola vez por código.
  useEffect(() => {
    if (invitationCode === null || preview === undefined) return;
    if (lastAcceptedCode.current === invitationCode) return;
    lastAcceptedCode.current = invitationCode;
    acceptInvitation();
  }, [invitationCode, preview, acceptInvitation]);

  const hasFailed = acceptance.previewError !== null || acceptance.acceptError !== null;
  return { isAccepting: invitationCode !== null && !hasFailed };
}
