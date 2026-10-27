import type { QueryClient } from '@tanstack/react-query';

const PLATFORM_KEY_PREFIX = '/v1/platform';

/** Tras un cambio en la administración se recarga todo lo de plataforma: cobros, informes y actividad. */
export function invalidatePlatformQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      typeof queryKey[0] === 'string' && queryKey[0].startsWith(PLATFORM_KEY_PREFIX),
  });
}
