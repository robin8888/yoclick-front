import { usePendingCenterStore } from '../model/pending-center-store';
import { usePendingInvitationStore } from '../model/pending-invitation-store';

/** «No es mi centro»: olvida la invitación, el código y el QR, y vuelve la marca de Yoclick. */
export function useClearAccessCenter(): () => void {
  const clearInvitation = usePendingInvitationStore((state) => state.clearInvitation);
  const clearPendingCenter = usePendingCenterStore((state) => state.clearPendingCenter);

  return () => {
    clearInvitation();
    clearPendingCenter();
  };
}
