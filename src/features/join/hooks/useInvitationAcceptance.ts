import { useQueryClient } from '@tanstack/react-query';

import {
  useJoinAcceptInvitation,
  useJoinGetInvitation,
} from '@/shared/api/generated/endpoints/join/join';
import { getMeListMembershipsQueryKey } from '@/shared/api/generated/endpoints/me/me';
import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

import { usePendingInvitationStore } from '../model/pending-invitation-store';

interface InvitationAcceptance {
  preview: InvitationPreviewResponseDto | undefined;
  isLoadingPreview: boolean;
  previewError: unknown;
  acceptInvitation: () => void;
  isAccepting: boolean;
  acceptError: unknown;
}

interface InvitationAcceptanceInput {
  /** Sin código no se consulta nada. */
  invitationCode: string | null;
  onAccepted: () => void;
}

/** Solo una aceptación a la vez, aunque haya dos pantallas pidiéndola. */
function tryBeginAcceptance(): boolean {
  const { isAcceptInFlight, setAcceptInFlight } = usePendingInvitationStore.getState();
  if (isAcceptInFlight) return false;
  setAcceptInFlight(true);
  return true;
}

function endAcceptance(): void {
  usePendingInvitationStore.getState().setAcceptInFlight(false);
}

/** Consulta qué centro y rol da la invitación y, si la persona acepta, la une como ese rol. */
export function useInvitationAcceptance({
  invitationCode,
  onAccepted,
}: InvitationAcceptanceInput): InvitationAcceptance {
  const queryClient = useQueryClient();
  const selectActiveCenter = useSessionStore((state) => state.selectActiveCenter);
  const clearInvitation = usePendingInvitationStore((state) => state.clearInvitation);
  const previewQuery = useJoinGetInvitation(invitationCode ?? '', {
    query: { enabled: invitationCode !== null, retry: false },
  });
  // Las acciones van en la propia mutación y no en `mutate`: así corren aunque la pantalla se
  // desmonte a mitad (p. ej. al cambiar la sesión) y la marca «en curso» nunca queda colgada.
  const acceptMutation = useJoinAcceptInvitation({
    mutation: {
      onSettled: endAcceptance,
      onSuccess: async (acceptedInvitation) => {
        await queryClient.invalidateQueries({ queryKey: getMeListMembershipsQueryKey() });
        selectActiveCenter(acceptedInvitation.centerId);
        clearInvitation();
        onAccepted();
      },
    },
  });

  function acceptInvitation(): void {
    if (invitationCode === null || !tryBeginAcceptance()) return;
    acceptMutation.mutate({ code: invitationCode });
  }

  return {
    preview: previewQuery.data,
    isLoadingPreview: previewQuery.isFetching,
    previewError: previewQuery.error,
    acceptInvitation,
    isAccepting: acceptMutation.isPending,
    acceptError: acceptMutation.error,
  };
}
