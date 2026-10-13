import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import type { ErrorType } from '@/shared/api/api-mutator';
import { getServicesListOpenSessionsQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { addDaysToIsoDate, getTodayIsoDate } from '@/shared/lib/format';

/** Hasta cuántos días por delante se ofrecen clases (el servidor admite 62 por consulta). */
const OFFER_HORIZON_DAYS = 60;

/**
 * Las clases con plazas del servicio elegido en los próximos 60 días y si el servicio tiene horario
 * de sala (`isScheduled`): con él solo se asigna a sus clases; sin él, la hora es libre.
 */
export function useServiceSessions(
  serviceId: string | null,
): UseQueryResult<ServiceSessionsResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const [todayIsoDate] = useState(() => getTodayIsoDate(new Date(), DEFAULT_CENTER_TIME_ZONE));

  return useQuery(
    getServicesListOpenSessionsQueryOptions(
      centerId ?? '',
      serviceId ?? '',
      { from: todayIsoDate, to: addDaysToIsoDate(todayIsoDate, OFFER_HORIZON_DAYS) },
      { query: { enabled: centerId !== null && serviceId !== null } },
    ),
  );
}
