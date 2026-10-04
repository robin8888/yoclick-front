import { useRouter } from 'expo-router';
import { useState } from 'react';

import type { MfaLoginResponseDto } from '@/shared/api/generated/model';
import { getSessionServices } from '@/shared/auth/default-session-services';
import { usePendingCenterStore, useJoinPendingCenter } from '@/features/join';

import { mapLoginResponseToSessionInput } from '../model/login-outcome';

interface CompleteSignIn {
  completeSignIn: (response: MfaLoginResponseDto) => void;
  hasSessionStartFailed: boolean;
}

/**
 * Último paso de un login (con o sin segundo factor): guarda la sesión, une al centro que la
 * persona eligió antes de entrar y deja que la pantalla de inicio decida a dónde ir.
 */
export function useCompleteSignIn(): CompleteSignIn {
  const router = useRouter();
  const [hasSessionStartFailed, setHasSessionStartFailed] = useState(false);
  const pendingCenter = usePendingCenterStore((state) => state.pendingCenter);
  const clearPendingCenter = usePendingCenterStore((state) => state.clearPendingCenter);
  const { joinPendingCenter } = useJoinPendingCenter();

  function goToHome(): void {
    router.replace('/');
  }

  async function startSessionAndJoin(response: MfaLoginResponseDto): Promise<void> {
    await getSessionServices().startSession(mapLoginResponseToSessionInput(response));
    if (pendingCenter === null) {
      goToHome();
      return;
    }
    // Si el centro no acepta (privado sin código, bloqueado) la sesión sigue abierta y la pantalla
    // de inicio mostrará los centros que sí tiene.
    joinPendingCenter(pendingCenter, {
      onJoined: goToHome,
      onFailed: () => {
        clearPendingCenter();
        goToHome();
      },
    });
  }

  function completeSignIn(response: MfaLoginResponseDto): void {
    setHasSessionStartFailed(false);
    startSessionAndJoin(response).catch(() => {
      setHasSessionStartFailed(true);
    });
  }

  return { completeSignIn, hasSessionStartFailed };
}
