import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { usePendingCenterStore } from '@/features/join';
import { getSessionServices } from '@/shared/auth/default-session-services';

import { useAuthFlowStore } from '../model/auth-flow-store';

interface SignOut {
  signOut: () => void;
  isSigningOut: boolean;
}

/**
 * Cierre de sesión completo (CLAUDE.md › Seguridad): token, caché de Query, stores y caché de
 * imágenes. El push token se desregistrará cuando exista el registro de notificaciones.
 */
export function useSignOut(): SignOut {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const clearPendingCenter = usePendingCenterStore((state) => state.clearPendingCenter);

  function signOut(): void {
    setIsSigningOut(true);
    void getSessionServices()
      .signOut()
      .then(() => {
        clearPendingCenter();
        useAuthFlowStore.setState({
          registrationDraft: null,
          pendingEmail: null,
          mfaChallengeToken: null,
          notice: null,
        });
        void Image.clearMemoryCache();
        void Image.clearDiskCache();
        router.replace('/join');
      })
      .finally(() => {
        setIsSigningOut(false);
      });
  }

  return { signOut, isSigningOut };
}
