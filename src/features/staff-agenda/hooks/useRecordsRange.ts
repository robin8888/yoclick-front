import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';

import { getTodayIsoDate, shiftIsoDate } from '../model/agenda-date';

export type RecordsRangeDays = '7' | '30';

interface RecordsRange {
  fromDate: string;
  toDate: string;
}

/** Los últimos 7 o 30 días contando hoy, en la zona del centro (la API admite hasta 31). */
export function useRecordsRange(rangeDays: RecordsRangeDays): RecordsRange {
  const toDate = getTodayIsoDate(new Date(), DEFAULT_CENTER_TIME_ZONE);
  const fromDate = shiftIsoDate(toDate, -(Number(rangeDays) - 1)) ?? toDate;
  return { fromDate, toDate };
}
