import { useState } from 'react';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';

import { getTodayIsoDate, shiftIsoDate } from '../model/agenda-date';

interface AgendaDay {
  isoDate: string;
  isToday: boolean;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

/** El día que se está mirando en la agenda; empieza en hoy (en la zona del centro). */
export function useAgendaDay(): AgendaDay {
  const [todayIsoDate] = useState(() => getTodayIsoDate(new Date(), DEFAULT_CENTER_TIME_ZONE));
  const [isoDate, setIsoDate] = useState(todayIsoDate);

  function move(dayOffset: number): void {
    setIsoDate((currentDate) => shiftIsoDate(currentDate, dayOffset) ?? currentDate);
  }

  return {
    isoDate,
    isToday: isoDate === todayIsoDate,
    goToPreviousDay: () => {
      move(-1);
    },
    goToNextDay: () => {
      move(1);
    },
  };
}
