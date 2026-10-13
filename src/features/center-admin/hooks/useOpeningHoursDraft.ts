import { useState } from 'react';

import {
  addRangeToDay,
  findDaysWithProblems,
  removeRangeFromDay,
  setDayOpen,
  setRangeTime,
  type OpeningHoursDraft,
  type TimeField,
} from '../model/opening-hours-draft';
import type { WeekDay } from '../model/opening-hours-summary';

export interface TimeChange {
  rangeIndex: number;
  field: TimeField;
  /** `HH:MM`. */
  time: string;
}

export interface OpeningHoursDraftEditing {
  draft: OpeningHoursDraft | null;
  daysWithProblems: readonly WeekDay[];
  changeDayOpen: (day: WeekDay, isOpen: boolean) => void;
  addRange: (day: WeekDay) => void;
  removeRange: (day: WeekDay, rangeIndex: number) => void;
  changeTime: (day: WeekDay, change: TimeChange) => void;
  /** Descarta lo editado y vuelve a lo publicado. */
  discardChanges: () => void;
}

/**
 * Un horario semanal en edición: lo publicado más lo que se va cambiando, sin copiar el servidor a
 * estado. Lo usan el horario del centro y el propio de cada persona del equipo.
 */
export function useOpeningHoursDraft(
  published: OpeningHoursDraft | null,
): OpeningHoursDraftEditing {
  const [edited, setEdited] = useState<OpeningHoursDraft | null>(null);
  const draft = edited ?? published;

  function change(transform: (current: OpeningHoursDraft) => OpeningHoursDraft): void {
    setEdited((current) => {
      const base = current ?? published;
      return base === null ? current : transform(base);
    });
  }

  return {
    draft,
    daysWithProblems: draft === null ? [] : findDaysWithProblems(draft),
    changeDayOpen: (day, isOpen) => {
      change((current) => setDayOpen(current, day, isOpen));
    },
    addRange: (day) => {
      change((current) => addRangeToDay(current, day));
    },
    removeRange: (day, rangeIndex) => {
      change((current) => removeRangeFromDay(current, day, rangeIndex));
    },
    changeTime: (day, { rangeIndex, field, time }) => {
      change((current) => setRangeTime({ draft: current, day, rangeIndex, field, time }));
    },
    discardChanges: () => {
      setEdited(null);
    },
  };
}
