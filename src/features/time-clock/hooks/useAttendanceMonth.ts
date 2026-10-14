import { useState } from 'react';

import { getTodayIsoDate } from '@/shared/lib/format';

import { getMonthIdOfDate, shiftMonthId } from '../model/month';

// Hasta que la API incluya la zona del centro en el perfil (docs/api-requests.md).
export const CENTER_TIME_ZONE = 'Europe/Madrid';

interface AttendanceMonth {
  /** Hoy, `YYYY-MM-DD`, en la zona del centro. */
  todayIsoDate: string;
  /** El mes que se está viendo, `YYYY-MM`. */
  monthId: string;
  isLastMonth: boolean;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

/** El mes que se mira en «Mi asistencia»: empieza en el actual y no pasa al futuro. */
export function useAttendanceMonth(): AttendanceMonth {
  const [todayIsoDate] = useState(() => getTodayIsoDate(new Date(), CENTER_TIME_ZONE));
  const currentMonthId = getMonthIdOfDate(todayIsoDate);
  const [monthId, setMonthId] = useState(currentMonthId);

  return {
    todayIsoDate,
    monthId,
    isLastMonth: monthId >= currentMonthId,
    goToPreviousMonth: () => {
      setMonthId(shiftMonthId(monthId, -1));
    },
    goToNextMonth: () => {
      setMonthId(shiftMonthId(monthId, 1));
    },
  };
}
