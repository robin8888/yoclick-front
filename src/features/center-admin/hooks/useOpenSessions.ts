import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import { meListSessions, meRevokeSession } from '@/shared/api/generated/endpoints/me/me';
import type { OpenSessionsResponseDto } from '@/shared/api/generated/model';
import { secureStorage } from '@/shared/storage/secure';

const OPEN_SESSIONS_QUERY_KEY = ['open-sessions'] as const;

/** Los dispositivos con sesión abierta; el servidor marca cuál es este con el token guardado. */
export function useOpenSessions(): UseQueryResult<OpenSessionsResponseDto, ErrorType> {
  return useQuery({
    queryKey: OPEN_SESSIONS_QUERY_KEY,
    queryFn: async (): Promise<OpenSessionsResponseDto> => {
      const refreshToken = await secureStorage.readRefreshToken();
      return refreshToken === null ? { sessions: [] } : meListSessions({ refreshToken });
    },
  });
}

interface CloseOpenSession {
  closeSession: (sessionId: string) => void;
  closingSessionId: string | null;
  errorMessage: string | null;
}

/** Cierra la sesión de otro dispositivo propio y vuelve a pedir la lista. No es optimista. */
export function useCloseOpenSession(): CloseOpenSession {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (sessionId: string) => meRevokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OPEN_SESSIONS_QUERY_KEY }),
  });

  return {
    closeSession: (sessionId) => {
      mutation.mutate(sessionId);
    },
    closingSessionId: mutation.isPending ? mutation.variables : null,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
