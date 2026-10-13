import { useState } from 'react';

import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { useTickingNow } from '@/shared/hooks/useTickingNow';
import { getTodayIsoDate } from '@/shared/lib/format';
import { keepFutureSlots } from '@/shared/lib/slot-hours';

/** Las clases que empiezan mientras se mira la pantalla dejan de ofrecerse; con mirar cada minuto basta. */
const NOW_REFRESH_MS = 60_000;

export type OpenClass = ServiceSessionsResponseDto['sessions'][number];

export interface ClassChoice {
  timeZone: string;
  todayIsoDate: string;
  /** Los días con alguna clase con plazas: los únicos que se pueden pulsar. */
  enabledDates: ReadonlySet<string>;
  selectedDate: string | null;
  /** Las clases del día elegido. */
  classesOfDay: OpenClass[];
  selectedClass: OpenClass | null;
  selectDate: (isoDate: string) => void;
  selectClass: (openClass: OpenClass) => void;
}

/** El día local (en la zona del centro) en que empieza una clase. */
function getLocalDate(startsAt: string, timeZone: string): string {
  return getTodayIsoDate(new Date(startsAt), timeZone);
}

/**
 * Elegir día y clase entre las que tienen plazas: nada que ya empezó ni que ya pasó, y el primer
 * día con clase queda elegido de entrada. `excludedSessionId` deja fuera la clase en la que ya está.
 */
export function useClassChoice(
  sessions: ServiceSessionsResponseDto,
  excludedSessionId?: string,
): ClassChoice {
  const now = useTickingNow(NOW_REFRESH_MS);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [chosenSessionId, setChosenSessionId] = useState<string | null>(null);
  const { timezone: timeZone } = sessions;
  const upcoming = keepFutureSlots(sessions.sessions, now).filter(
    (candidate) => candidate.id !== excludedSessionId,
  );
  const firstClass = upcoming[0];
  const selectedDate =
    chosenDate ?? (firstClass === undefined ? null : getLocalDate(firstClass.startsAt, timeZone));
  const classesOfDay = upcoming.filter(
    (candidate) => getLocalDate(candidate.startsAt, timeZone) === selectedDate,
  );

  return {
    timeZone,
    todayIsoDate: getTodayIsoDate(now, timeZone),
    enabledDates: new Set(upcoming.map((candidate) => getLocalDate(candidate.startsAt, timeZone))),
    selectedDate,
    classesOfDay,
    selectedClass: classesOfDay.find((candidate) => candidate.id === chosenSessionId) ?? null,
    selectDate: (isoDate) => {
      setChosenDate(isoDate);
      setChosenSessionId(null);
    },
    selectClass: (openClass) => {
      setChosenSessionId(openClass.id);
    },
  };
}
