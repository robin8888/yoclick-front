import { useState } from 'react';

import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';

import { useClassChoice, type ClassChoice, type OpenClass } from './useClassChoice';

export interface ClassSelection {
  /** El calendario y las clases del día enfocado. */
  choice: ClassChoice;
  /** Las clases elegidas, en orden de fecha: como mucho una por día. */
  pickedClasses: OpenClass[];
  /** Los días que ya tienen una clase elegida. */
  pickedDates: ReadonlySet<string>;
  /** La clase elegida del día enfocado, si la hay. */
  pickedClassOfDay: OpenClass | null;
  /** Cuántas clases se pueden elegir en total (las del bono; una sin bono). */
  maxSelections: number;
  isLimitReached: boolean;
  togglePickedClass: (openClass: OpenClass) => void;
}

/**
 * Elegir varias clases de un servicio, una por día, hasta completar las que permite el bono. Elegir
 * otra clase del mismo día sustituye a la anterior de ese día; volver a pulsar la elegida la quita.
 */
export function useClassSelection(
  sessions: ServiceSessionsResponseDto,
  maxSelections: number,
): ClassSelection {
  const choice = useClassChoice(sessions);
  const [pickedByDate, setPickedByDate] = useState<Readonly<Record<string, OpenClass>>>({});
  const pickedClasses = Object.values(pickedByDate).sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt),
  );
  const date = choice.selectedDate;
  const pickedClassOfDay = date === null ? null : (pickedByDate[date] ?? null);
  const isLimitReached = pickedClasses.length >= maxSelections;

  return {
    choice,
    pickedClasses,
    pickedDates: new Set(Object.keys(pickedByDate)),
    pickedClassOfDay,
    maxSelections,
    isLimitReached,
    togglePickedClass: (openClass) => {
      if (date === null) return;
      setPickedByDate((current) => {
        if (current[date]?.id === openClass.id) {
          return Object.fromEntries(Object.entries(current).filter(([key]) => key !== date));
        }
        const isNewDay = current[date] === undefined;
        if (isNewDay && Object.keys(current).length >= maxSelections) return current;
        return { ...current, [date]: openClass };
      });
    },
  };
}
