import { addDaysToIsoDate, zonedDateTimeToUtc } from '@/shared/lib/format';

export interface EntryInstants {
  clockInAt: string;
  clockOutAt: string;
  /** La salida cae al día siguiente (turno que pasa de medianoche). */
  isOutOnNextDay: boolean;
}

/**
 * Del día y las horas locales («09:00» y «17:30») a los instantes que guarda el servidor. Una salida
 * igual o anterior a la entrada es del día siguiente: un turno de noche.
 */
export function buildEntryInstants(input: {
  workDate: string;
  inTime: string;
  outTime: string;
  timeZone: string;
}): EntryInstants {
  const isOutOnNextDay = input.outTime <= input.inTime;
  const outDate = isOutOnNextDay ? addDaysToIsoDate(input.workDate, 1) : input.workDate;
  return {
    clockInAt: zonedDateTimeToUtc(input.workDate, input.inTime, input.timeZone).toISOString(),
    clockOutAt: zonedDateTimeToUtc(outDate, input.outTime, input.timeZone).toISOString(),
    isOutOnNextDay,
  };
}
