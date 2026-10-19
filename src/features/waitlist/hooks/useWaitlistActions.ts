import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getBookingsListMineQueryKey } from '@/shared/api/generated/endpoints/bookings/bookings';
import {
  getWaitlistListMineQueryKey,
  waitlistConfirm,
  waitlistJoin,
  waitlistLeave,
} from '@/shared/api/generated/endpoints/waitlist/waitlist';
import { useSessionStore } from '@/shared/auth/session-store';

interface WaitlistActions {
  joinWaitlist: (classSessionId: string) => void;
  leaveWaitlist: (entryId: string) => void;
  confirmOffer: (entryId: string) => void;
  isBusy: boolean;
  errorMessage: string | null;
}

/**
 * Apuntarse, salir y confirmar la plaza ofrecida. Nada es optimista (CLAUDE.md): se espera al
 * servidor y se recargan la espera, las citas y las plazas de las clases, que cambian con cada una.
 */
export function useWaitlistActions(): WaitlistActions {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const refreshAll = (): void => {
    void queryClient.invalidateQueries({ queryKey: getWaitlistListMineQueryKey(centerId) });
    void queryClient.invalidateQueries({ queryKey: getBookingsListMineQueryKey(centerId) });
    void queryClient.invalidateQueries({
      predicate: (query) => String(query.queryKey[0]).includes('/open-sessions'),
    });
  };
  const join = useMutation({
    mutationFn: (classSessionId: string) => waitlistJoin(centerId, classSessionId),
    onSuccess: refreshAll,
  });
  const leave = useMutation({
    mutationFn: (entryId: string) => waitlistLeave(centerId, entryId),
    onSuccess: refreshAll,
  });
  const confirm = useMutation({
    mutationFn: (entryId: string) => waitlistConfirm(centerId, entryId),
    onSuccess: refreshAll,
  });
  const failed = [join, leave, confirm].find((mutation) => mutation.isError);

  return {
    joinWaitlist: join.mutate,
    leaveWaitlist: leave.mutate,
    confirmOffer: confirm.mutate,
    isBusy: join.isPending || leave.isPending || confirm.isPending,
    errorMessage: failed?.error ? getApiErrorMessage(failed.error) : null,
  };
}
