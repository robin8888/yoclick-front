import { useQueryClient } from '@tanstack/react-query';

import { useJoinCenter } from '@/shared/api/generated/endpoints/join/join';
import { getMeListMembershipsQueryKey } from '@/shared/api/generated/endpoints/me/me';
import { useSessionStore } from '@/shared/auth/session-store';

import type { PendingCenter } from '../model/pending-center';
import { usePendingCenterStore } from '../model/pending-center-store';

interface JoinCallbacks {
  /** Solo si el servidor acepta: el centro ya es el activo y el borrador se ha limpiado. */
  onJoined: () => void;
  onFailed?: () => void;
}

interface JoinPendingCenterResult {
  joinPendingCenter: (center: PendingCenter, callbacks: JoinCallbacks) => void;
  isJoining: boolean;
  joinError: unknown;
}

/** Une a la persona con sesión al centro elegido; el centro activo pasa a ser ese. */
export function useJoinPendingCenter(): JoinPendingCenterResult {
  const queryClient = useQueryClient();
  const joinMutation = useJoinCenter();
  const selectActiveCenter = useSessionStore((state) => state.selectActiveCenter);
  const clearPendingCenter = usePendingCenterStore((state) => state.clearPendingCenter);

  function joinPendingCenter(center: PendingCenter, callbacks: JoinCallbacks): void {
    const { joinCode, joinSource } = center;
    joinMutation.mutate(
      {
        centerId: center.id,
        data: {
          ...(joinCode === undefined ? {} : { joinCode }),
          ...(joinSource === undefined ? {} : { source: joinSource }),
        },
      },
      {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getMeListMembershipsQueryKey() })
            .then(() => {
              selectActiveCenter(center.id);
              clearPendingCenter();
              callbacks.onJoined();
            });
        },
        onError: () => callbacks.onFailed?.(),
      },
    );
  }

  return { joinPendingCenter, isJoining: joinMutation.isPending, joinError: joinMutation.error };
}
