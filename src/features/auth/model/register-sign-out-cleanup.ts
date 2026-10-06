import { registerSignOutCleanup } from '@/shared/auth/sign-out-cleanup';

import { useAuthFlowStore } from './auth-flow-store';

// Al cerrar sesión se olvida lo que quedaba a medias del registro y del segundo factor.
registerSignOutCleanup(() => {
  useAuthFlowStore.setState({
    registrationDraft: null,
    pendingEmail: null,
    mfaChallengeToken: null,
    notice: null,
  });
});
