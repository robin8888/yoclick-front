import type { MfaConfirmResponseDto } from '@/shared/api/generated/model';
import { getSessionServices } from '@/shared/auth/default-session-services';
import { useSessionStore } from '@/shared/auth/session-store';

/**
 * Al activar el segundo factor el servidor entrega una sesión ya verificada con él: la app la usa
 * en lugar de la anterior para que las rutas de administración funcionen sin volver a iniciar sesión.
 */
export async function startVerifiedSession(
  verifiedSession: MfaConfirmResponseDto['session'],
): Promise<void> {
  const { user } = useSessionStore.getState();
  if (user === null) return;
  await getSessionServices().startSession({
    accessToken: verifiedSession.accessToken,
    refreshToken: verifiedSession.refreshToken,
    user,
  });
}
