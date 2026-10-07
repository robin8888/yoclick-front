import { meUnregisterPushDevice } from '@/shared/api/generated/endpoints/me/me';
import { registerPreSignOutTask } from '@/shared/auth/sign-out-cleanup';

import { usePushTokenStore } from './push-token-store';

// Al cerrar sesión este móvil deja de recibir los avisos de esa cuenta (CLAUDE.md › Seguridad).
registerPreSignOutTask(async () => {
  const { registeredToken, setRegisteredToken } = usePushTokenStore.getState();
  if (registeredToken === null) return;
  await meUnregisterPushDevice({ token: registeredToken });
  setRegisteredToken(null);
});
