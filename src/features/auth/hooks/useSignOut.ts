import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { usePendingCenterStore, usePendingInvitationStore } from '@/features/join';
import { useCenterCreationIntentStore } from '@/features/onboarding';
import { getSessionServices } from '@/shared/auth/default-session-services';

import { useAuthFlowStore, type AuthNotice } from '../model/auth-flow-store';

interface SignOut {
  signOut: () => void;
  isSigningOut: boolean;
}

/**
 * Cierre de sesión completo (CLAUDE.md › Seguridad): token, caché de Query, stores y caché de
 * imágenes. El push token se desregistrará cuando exista el registro de notificaciones.
 */
interface SignOutOptions {
  /** Aviso que se enseña en el login tras salir (p. ej. «entra con tu código»). */
  noticeAfterSignOut?: AuthNotice;
}

export function useSignOut({ noticeAfterSignOut }: SignOutOptions = {}): SignOut {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const clearPendingCenter = usePendingCenterStore((state) => state.clearPendingCenter);

  function signOut(): void {
    setIsSigningOut(true);
    void getSessionServices()
      .signOut()
      .then(() => {
        clearPendingCenter();
        usePendingInvitationStore.getState().clearInvitation();
        useCenterCreationIntentStore.getState().finishCenterCreation();
        useAuthFlowStore.setState({
          registrationDraft: null,
          pendingEmail: null,
          mfaChallengeToken: null,
          notice: noticeAfterSignOut ?? null,
        });
        void Image.clearMemoryCache();
        void Image.clearDiskCache();
        router.replace('/');
      })
      .finally(() => {
        setIsSigningOut(false);
      });
  }

  return { signOut, isSigningOut };
}
