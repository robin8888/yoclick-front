import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getTeamListQueryKey, teamUpdateMember } from '@/shared/api/generated/endpoints/team/team';
import type { UpdateTeamMemberRequestDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface UpdateTeamMember {
  updateMember: (changes: UpdateTeamMemberRequestDto) => void;
  isUpdating: boolean;
  errorMessage: string | null;
}

/** Cambia el rol, el cargo o el estado de alguien del equipo; no es optimista: manda el servidor. */
export function useUpdateTeamMember(membershipId: string, onDone: () => void): UpdateTeamMember {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (changes: UpdateTeamMemberRequestDto) =>
      teamUpdateMember(centerId, membershipId, changes),
  });

  return {
    updateMember: (changes) => {
      mutation.mutate(changes, {
        onSuccess: () => {
          // El equipo también alimenta «quién da este servicio» y la agenda del centro.
          void queryClient
            .invalidateQueries({ queryKey: getTeamListQueryKey(centerId) })
            .then(onDone);
        },
      });
    },
    isUpdating: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
