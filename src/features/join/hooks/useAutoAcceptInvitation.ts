import { useEffect, useRef, useState } from 'react';

import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';

import { usePendingInvitationStore } from '../model/pending-invitation-store';

interface AutoAcceptInput {
  /** El código con el que entró la pantalla (enlace o registro), antes de que se borre al aceptar. */
  linkedCode: string | null;
  submittedCode: string | null;
  invitation: InvitationPreviewResponseDto | undefined;
  hasAcceptFailed: boolean;
  acceptInvitation: () => void;
}

/**
 * Quien trae el código del registro o escribe uno ya ha decidido entrar: se acepta sola, una vez
 * por código, y la vista previa no llega a verse. Solo se pregunta si el código llega por enlace
 * con la sesión ya iniciada, porque podría ser otra cuenta.
 */
export function useAutoAcceptInvitation(input: Readonly<AutoAcceptInput>): boolean {
  const { linkedCode, submittedCode, invitation, hasAcceptFailed, acceptInvitation } = input;
  // Se recuerda al entrar: al aceptar, el almacén se vacía y no debe reaparecer la vista previa.
  const [hasAutoAcceptPermission] = useState(
    () => usePendingInvitationStore.getState().isAutoAcceptAllowed,
  );
  const lastAutoAcceptedCode = useRef<string | null>(null);
  const isCodeTyped = submittedCode !== null && submittedCode !== linkedCode;
  const shouldAutoAccept = hasAutoAcceptPermission || isCodeTyped;

  // Aceptar sola es sincronizar con el servidor; si falla, queda el botón con el error.
  useEffect(() => {
    if (!shouldAutoAccept || invitation === undefined) return;
    if (lastAutoAcceptedCode.current === submittedCode) return;
    lastAutoAcceptedCode.current = submittedCode;
    acceptInvitation();
  }, [shouldAutoAccept, invitation, submittedCode, acceptInvitation]);

  return shouldAutoAccept && invitation !== undefined && !hasAcceptFailed;
}
