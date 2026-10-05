import { useMyCenters } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';

const PLATFORM_NAME = 'Yoclick';

interface ActiveCenterSummary {
  /** «Yoclick» mientras no se conoce el centro. */
  name: string;
  logoUrl: string | null;
}

/** Nombre y logo del centro en el que está la persona, si sus centros ya han cargado. */
export function useActiveCenterSummary(): ActiveCenterSummary {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const { data: myCenters } = useMyCenters();
  const activeCenter = myCenters?.memberships.find(
    (membership) => membership.centerId === activeCenterId,
  )?.center;

  return { name: activeCenter?.name ?? PLATFORM_NAME, logoUrl: activeCenter?.logoUrl ?? null };
}
