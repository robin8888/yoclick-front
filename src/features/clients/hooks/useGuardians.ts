import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getGuardiansListQueryKey,
  getGuardiansListQueryOptions,
  guardiansLink,
  guardiansUnlink,
} from '@/shared/api/generated/endpoints/guardians/guardians';
import type { GuardianListResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

function useCenterId(): string {
  return useSessionStore((state) => state.activeCenterId) ?? '';
}

/** Los tutores enlazados a una persona del centro. */
export function useGuardians(
  childMembershipId: string,
): UseQueryResult<GuardianListResponseDto, ErrorType> {
  return useQuery(getGuardiansListQueryOptions(useCenterId(), childMembershipId));
}

interface GuardianLinking {
  link: (guardianMembershipId: string, onLinked: () => void) => void;
  unlink: (guardianMembershipId: string) => void;
  isBusy: boolean;
  errorMessage: string | null;
}

/** Enlaza o quita a un tutor; no es optimista: se espera al servidor y se recarga la lista. */
export function useGuardianLinking(childMembershipId: string): GuardianLinking {
  const centerId = useCenterId();
  const queryClient = useQueryClient();
  const refresh = (): void => {
    void queryClient.invalidateQueries({
      queryKey: getGuardiansListQueryKey(centerId, childMembershipId),
    });
  };
  const linkMutation = useMutation({
    mutationFn: (guardianMembershipId: string) =>
      guardiansLink(centerId, childMembershipId, { guardianMembershipId }),
    onSuccess: refresh,
  });
  const unlinkMutation = useMutation({
    mutationFn: (guardianMembershipId: string) =>
      guardiansUnlink(centerId, childMembershipId, guardianMembershipId),
    onSuccess: refresh,
  });
  const failure = linkMutation.error ?? unlinkMutation.error;

  return {
    link: (guardianMembershipId, onLinked) => {
      linkMutation.mutate(guardianMembershipId, { onSuccess: onLinked });
    },
    unlink: (guardianMembershipId) => {
      unlinkMutation.mutate(guardianMembershipId);
    },
    isBusy: linkMutation.isPending || unlinkMutation.isPending,
    errorMessage: failure === null ? null : getApiErrorMessage(failure),
  };
}
