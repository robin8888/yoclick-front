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

  async function finishJoin(center: PendingCenter, callbacks: JoinCallbacks): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: getMeListMembershipsQueryKey() });
    selectActiveCenter(center.id);
    clearPendingCenter();
    callbacks.onJoined();
  }

  /**
   * Se espera con la promesa y no con los avisos de `mutate`: al iniciar sesión la pantalla de
   * login se cierra en cuanto hay sesión, y los avisos de `mutate` no se llaman si la pantalla que
   * los pidió ya no existe. Sin esto la persona entraba al centro en el servidor pero la app no
   * se enteraba y la dejaba en «Sin centro todavía».
   */
  function joinPendingCenter(center: PendingCenter, callbacks: JoinCallbacks): void {
    const { joinCode, joinSource } = center;
    joinMutation
      .mutateAsync({
        centerId: center.id,
        data: {
          ...(joinCode === undefined ? {} : { joinCode }),
          ...(joinSource === undefined ? {} : { source: joinSource }),
        },
      })
      .then(
        () => finishJoin(center, callbacks),
        () => {
          callbacks.onFailed?.();
        },
      )
      .catch(() => {
        callbacks.onFailed?.();
      });
  }

  return { joinPendingCenter, isJoining: joinMutation.isPending, joinError: joinMutation.error };
}
