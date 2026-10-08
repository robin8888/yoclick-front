import { usePendingCenterStore } from '../model/pending-center-store';
import type { AccessCenter } from '../model/access-center';
import { useInvitedCenterPreview } from './useInvitedCenterPreview';

/**
 * El centro por el que entra la persona antes de tener cuenta: el de su invitación (manda, trae
 * rol) o el que eligió con el código o el QR del centro. `undefined` = la marca de Yoclick.
 */
export function useAccessCenter(): AccessCenter | undefined {
  const invitation = useInvitedCenterPreview();
  const pendingCenter = usePendingCenterStore((state) => state.pendingCenter);

  if (invitation !== undefined) {
    return { ...invitation.center, role: invitation.role, emailHint: invitation.emailHint };
  }
  if (pendingCenter === null) return undefined;
  return {
    id: pendingCenter.id,
    name: pendingCenter.name,
    sectorId: pendingCenter.sectorId,
    brandColor: pendingCenter.brandHexColor,
    logoUrl: pendingCenter.logoUrl,
    role: 'client',
    emailHint: null,
  };
}
