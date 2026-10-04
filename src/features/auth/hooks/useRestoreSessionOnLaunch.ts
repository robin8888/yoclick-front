import { useEffect, useState } from 'react';

import { getSessionServices } from '@/shared/auth/default-session-services';

interface RestoreSessionOnLaunch {
  /** El refresh falló por red o por el servidor (no por una sesión rechazada): hay que reintentar. */
  hasRestoreFailed: boolean;
  retryRestore: () => void;
}

/** Al abrir la app intercambia el refresh token guardado por un access token en memoria. */
export function useRestoreSessionOnLaunch(): RestoreSessionOnLaunch {
  const [hasRestoreFailed, setHasRestoreFailed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Sincroniza con un sistema externo (SecureStore y la API); `attemptCount` relanza el intento.
  useEffect(() => {
    getSessionServices()
      .restoreSession()
      .catch(() => {
        setHasRestoreFailed(true);
      });
  }, [attemptCount]);

  return {
    hasRestoreFailed,
    retryRestore: () => {
      setHasRestoreFailed(false);
      setAttemptCount((previousCount) => previousCount + 1);
    },
  };
}
