import type { QueryClient } from '@tanstack/react-query';

import type { SecureStorage } from '@/shared/storage/secure';

export interface LocalSignOutDependencies {
  secureStorage: Pick<SecureStorage, 'clear'>;
  queryClient: Pick<QueryClient, 'clear'>;
  resetSession: () => void;
}

/**
 * Cierre de sesión local (SEC-04): borra el refresh token, la caché de Query y la sesión en memoria.
 * Lo de memoria va primero y es síncrono para que la UI deje de mostrar datos del usuario
 * aunque el borrado en SecureStore tarde o falle.
 */
export function createLocalSignOut(dependencies: LocalSignOutDependencies): () => Promise<void> {
  return async function signOutLocally(): Promise<void> {
    dependencies.resetSession();
    dependencies.queryClient.clear();
    await dependencies.secureStorage.clear();
  };
}
