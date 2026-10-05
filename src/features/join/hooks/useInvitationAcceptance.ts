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
  const acceptMutation = useJoinAcceptInvitation();

  function acceptInvitation(): void {
    if (invitationCode === null) return;
    acceptMutation.mutate(
      { code: invitationCode },
      {
        onSuccess: (acceptedInvitation) => {
          void queryClient
            .invalidateQueries({ queryKey: getMeListMembershipsQueryKey() })
            .then(() => {
              selectActiveCenter(acceptedInvitation.centerId);
              clearInvitation();
              onAccepted();
            });
        },
      },
    );
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
