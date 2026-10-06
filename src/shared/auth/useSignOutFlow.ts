import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { getSessionServices } from './default-session-services';
import { useSessionStore } from './session-store';
import { runSignOutCleanups } from './sign-out-cleanup';

export interface SignOutFlow {
  isSignedIn: boolean;
  signOut: () => void;
  isSigningOut: boolean;
}

interface SignOutFlowOptions {
  /** Se ejecuta ya cerrada la sesión y antes de volver a la raíz (p. ej. dejar un aviso en el login). */
  onSignedOut?: () => void;
}

/**
 * Cierre de sesión completo (CLAUDE.md › Seguridad): token, caché de Query, estado de cada módulo,
 * caché de imágenes y vuelta a la raíz. El push token se desregistrará cuando exista el registro
 * de notificaciones.
 */
export function useSignOutFlow({ onSignedOut }: SignOutFlowOptions = {}): SignOutFlow {
  const router = useRouter();
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const [isSigningOut, setIsSigningOut] = useState(false);

  function signOut(): void {
    setIsSigningOut(true);
    void getSessionServices()
      .signOut()
      .then(() => {
        runSignOutCleanups();
        onSignedOut?.();
        void Image.clearMemoryCache();
        void Image.clearDiskCache();
        router.replace('/');
      })
      .finally(() => {
        setIsSigningOut(false);
      });
  }

  return { isSignedIn, signOut, isSigningOut };
}
