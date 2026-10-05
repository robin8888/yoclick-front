import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getInvitationsListPendingQueryKey,
  invitationsCreate,
  useInvitationsListPending,
} from '@/shared/api/generated/endpoints/team/team';
import type { PendingInvitationsResponseDtoInvitationsItem } from '@/shared/api/generated/model';
import { createIdempotencyIntention } from '@/shared/api/idempotency';

import { useActiveCenterId } from './useActiveCenterId';

// Literal y no el valor de `generated/model`: Metro no resuelve los `.ts` de ese índice en runtime.
const INSTRUCTOR_ROLE = 'staff';

interface InstructorInvitations {
  pendingInvitations: readonly PendingInvitationsResponseDtoInvitationsItem[];
  isLoading: boolean;
  inviteInstructor: (email: string, onInvited: () => void) => void;
  isInviting: boolean;
  inviteErrorMessage: string | null;
}

/** Invitaciones de instructor del centro: las pendientes y enviar una nueva por correo. */
export function useInstructorInvitations(): InstructorInvitations {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const pendingQuery = useInvitationsListPending(centerId);
  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      invitationsCreate(
        centerId,
        { email, role: INSTRUCTOR_ROLE },
        { headers: createIdempotencyIntention().headers },
      ),
  });

  return {
    pendingInvitations: (pendingQuery.data?.invitations ?? []).filter(
      (invitation) => invitation.role === INSTRUCTOR_ROLE,
    ),
    isLoading: pendingQuery.isPending,
    inviteInstructor: (email, onInvited) => {
      inviteMutation.mutate(email, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getInvitationsListPendingQueryKey(centerId) })
            .then(onInvited);
        },
      });
    },
    isInviting: inviteMutation.isPending,
    inviteErrorMessage: inviteMutation.isError ? getApiErrorMessage(inviteMutation.error) : null,
  };
}
