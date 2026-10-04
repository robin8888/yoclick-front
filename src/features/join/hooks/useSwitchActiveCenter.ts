import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';

// Las consultas de cuenta (`/v1/me…`) no dependen del centro; el resto sí y no debe mezclarse.
const ACCOUNT_QUERY_KEY_PREFIX = '/v1/me';

function isCenterScopedQueryKey(queryKey: readonly unknown[]): boolean {
  const [firstKeyPart] = queryKey;
  return typeof firstKeyPart !== 'string' || !firstKeyPart.startsWith(ACCOUNT_QUERY_KEY_PREFIX);
}

/** Cambia de centro activo descartando la caché del centro anterior (CLAUDE.md › Estado y datos)
 * y vuelve a la raíz, que lleva al inicio del nuevo centro con su marca. */
export function useSwitchActiveCenter(): (centerId: string) => void {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectActiveCenter = useSessionStore((state) => state.selectActiveCenter);

  return (centerId) => {
    queryClient.removeQueries({ predicate: (query) => isCenterScopedQueryKey(query.queryKey) });
    selectActiveCenter(centerId);
    router.replace('/');
  };
}
