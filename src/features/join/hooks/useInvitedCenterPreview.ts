import { useJoinGetInvitation } from '@/shared/api/generated/endpoints/join/join';
import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';

import { usePendingInvitationStore } from '../model/pending-invitation-store';

const MILLISECONDS_PER_MINUTE = 60_000;
const PREVIEW_STALE_MINUTES = 5;
const PREVIEW_STALE_TIME_MS = PREVIEW_STALE_MINUTES * MILLISECONDS_PER_MINUTE;

/**
 * Centro y rol de la invitación que la persona trae (por enlace o escrita), antes de tener cuenta.
 * `undefined` sin invitación, mientras carga o si el código ya no vale: entonces la app se ve
 * con la marca de Yoclick.
 */
export function useInvitedCenterPreview(): InvitationPreviewResponseDto | undefined {
  const invitationCode = usePendingInvitationStore((state) => state.invitationCode);
  const preview = useJoinGetInvitation(invitationCode ?? '', {
    query: { enabled: invitationCode !== null, retry: false, staleTime: PREVIEW_STALE_TIME_MS },
  });

  return invitationCode === null || preview.isError ? undefined : preview.data;
}
