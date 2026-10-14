import { useState } from 'react';

import type { TimeEntryResponseDto } from '@/shared/api/generated/model';
import { formatTime24h } from '@/shared/lib/format/format-time';

import { buildEntryInstants, type EntryInstants } from '../model/entry-instants';

const DEFAULT_IN_TIME = '09:00';
const DEFAULT_OUT_TIME = '17:00';

export interface TimeEntryDraftState extends EntryInstants {
  workDate: string;
  inTime: string;
  outTime: string;
  setWorkDate: (isoDate: string) => void;
  setInTime: (time: string) => void;
  setOutTime: (time: string) => void;
}

/**
 * Lo que la persona va eligiendo al corregir o añadir un fichaje: el día y las dos horas locales,
 * y los instantes que de ahí salen para el servidor (la salida pasa al día siguiente si hace falta).
 */
export function useTimeEntryDraft(input: {
  entry: TimeEntryResponseDto | null;
  timeZone: string;
  todayIsoDate: string;
}): TimeEntryDraftState {
  const { entry, timeZone, todayIsoDate } = input;
  const [workDate, setWorkDate] = useState(entry?.workDate ?? todayIsoDate);
  const [inTime, setInTime] = useState(
    entry === null ? DEFAULT_IN_TIME : formatTime24h(entry.clockInAt, timeZone),
  );
  const [outTime, setOutTime] = useState(
    entry?.clockOutAt == null ? DEFAULT_OUT_TIME : formatTime24h(entry.clockOutAt, timeZone),
  );

  return {
    workDate,
    inTime,
    outTime,
    setWorkDate,
    setInTime,
    setOutTime,
    ...buildEntryInstants({ workDate, inTime, outTime, timeZone }),
  };
}
