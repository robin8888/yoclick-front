import { useRouter } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';

import type { PendingCenter } from '../model/pending-center';
import { usePendingCenterStore } from '../model/pending-center-store';
import { useJoinPendingCenter } from './useJoinPendingCenter';

interface CenterJoinConfirmation {
  confirmJoin: () => void;
  isJoining: boolean;
  joinError: unknown;
}

/**
 * Sin sesión, «Unirme» solo guarda el centro elegido y sigue a crear cuenta o entrar;
 * con sesión, une de verdad y vuelve al inicio.
 */
export function useCenterJoinConfirmation(centerToJoin: PendingCenter): CenterJoinConfirmation {
  const router = useRouter();
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const selectPendingCenter = usePendingCenterStore((state) => state.selectPendingCenter);
  const { joinPendingCenter, isJoining, joinError } = useJoinPendingCenter();

  function confirmJoin(): void {
    if (isSignedIn) {
      joinPendingCenter(centerToJoin, {
        onJoined: () => {
          router.replace('/');
        },
      });
      return;
    }
    selectPendingCenter(centerToJoin);
    router.push('/(auth)/welcome');
  }

  return { confirmJoin, isJoining, joinError };
}
