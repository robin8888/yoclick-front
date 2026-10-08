import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';

import { usePendingInvitationStore } from '../model/pending-invitation-store';
import { useInvitationAcceptance } from './useInvitationAcceptance';
import { useInvitationCodeForm } from './useInvitationCodeForm';

interface InvitationFlow {
  form: ReturnType<typeof useInvitationCodeForm>;
  acceptance: ReturnType<typeof useInvitationAcceptance>;
  /** La invitación consultada, o `undefined` mientras falta el código o falla. */
  invitation: InvitationPreviewResponseDto | undefined;
  failure: unknown;
  handleSecondaryPress: () => void;
}

/** Une el código (escrito o llegado por enlace), la consulta de la invitación y su aceptación. */
export function useInvitationFlow(): InvitationFlow {
  const router = useRouter();
  const savedCode = usePendingInvitationStore((state) => state.invitationCode);
  const clearInvitation = usePendingInvitationStore((state) => state.clearInvitation);
  const isAutoAcceptAllowed = usePendingInvitationStore((state) => state.isAutoAcceptAllowed);
  const hasAutoAccepted = useRef(false);
  const form = useInvitationCodeForm(savedCode);
  const acceptance = useInvitationAcceptance({
    invitationCode: form.submittedCode,
    onAccepted: () => {
      router.replace('/');
    },
  });
  const invitation = acceptance.previewError === null ? acceptance.preview : undefined;
  const { acceptInvitation } = acceptance;

  // Aceptar sola es sincronizar con el servidor, y una sola vez: si falla, queda el botón.
  useEffect(() => {
    if (!isAutoAcceptAllowed || invitation === undefined || hasAutoAccepted.current) return;
    hasAutoAccepted.current = true;
    acceptInvitation();
  }, [isAutoAcceptAllowed, invitation, acceptInvitation]);

  function handleSecondaryPress(): void {
    if (invitation !== undefined) {
      form.resetCode();
      return;
    }
    clearInvitation();
    router.replace('/join');
  }

  return {
    form,
    acceptance,
    invitation,
    failure: acceptance.previewError ?? acceptance.acceptError,
    handleSecondaryPress,
  };
}
