import { registerSignOutCleanup } from '@/shared/auth/sign-out-cleanup';

import { useCenterCreationIntentStore } from './center-creation-intent-store';

// Al cerrar sesión se olvida que se estaba creando un centro.
registerSignOutCleanup(() => {
  useCenterCreationIntentStore.getState().finishCenterCreation();
});
