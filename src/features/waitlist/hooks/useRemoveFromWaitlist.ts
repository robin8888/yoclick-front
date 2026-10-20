import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getWaitlistListForSessionQueryKey,
  waitlistRemoveFromSession,
} from '@/shared/api/generated/endpoints/waitlist/waitlist';
import { useSessionStore } from '@/shared/auth/session-store';

interface RemoveFromWaitlist {
  removeFromWaitlist: (entryId: string, onRemoved: () => void) => void;
  isRemoving: boolean;
  errorMessage: string | null;
}

/** El personal quita a alguien de la espera de una clase; no es optimista: se espera al servidor. */
export function useRemoveFromWaitlist(classSessionId: string): RemoveFromWaitlist {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const removal = useMutation({
    mutationFn: (entryId: string) => waitlistRemoveFromSession(centerId, classSessionId, entryId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: getWaitlistListForSessionQueryKey(centerId, classSessionId),
      }),
  });

  return {
    removeFromWaitlist: (entryId, onRemoved) => {
      removal.mutate(entryId, { onSuccess: onRemoved });
    },
    isRemoving: removal.isPending,
    errorMessage: removal.isError ? getApiErrorMessage(removal.error) : null,
  };
}
