import { useRouter } from 'expo-router';

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
  const form = useInvitationCodeForm(savedCode);
  const acceptance = useInvitationAcceptance({
    invitationCode: form.submittedCode,
    onAccepted: () => {
      router.replace('/');
    },
  });
  const invitation = acceptance.previewError === null ? acceptance.preview : undefined;

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
