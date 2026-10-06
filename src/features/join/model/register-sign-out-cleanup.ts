import { registerSignOutCleanup } from '@/shared/auth/sign-out-cleanup';

import { usePendingCenterStore } from './pending-center-store';
import { usePendingInvitationStore } from './pending-invitation-store';

// Al cerrar sesión se olvida el centro elegido y la invitación pendiente.
registerSignOutCleanup(() => {
  usePendingCenterStore.getState().clearPendingCenter();
  usePendingInvitationStore.getState().clearInvitation();
});
