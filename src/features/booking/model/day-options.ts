import { describeIsoDate, type BookableDate } from './booking-dates';

export interface DayOption extends BookableDate {
  hasSlots: boolean;
}

interface ServerDay {
  date: string;
  slots: readonly unknown[];
}

/** Los días que devolvió el servidor, con sus etiquetas; un día con una fecha ilegible se ignora. */
export function buildDayOptions(serverDays: readonly ServerDay[]): DayOption[] {
  return serverDays.flatMap((serverDay) => {
    const description = describeIsoDate(serverDay.date);
    return description === null ? [] : [{ ...description, hasSlots: serverDay.slots.length > 0 }];
  });
}

/** El día que se enseña al abrir la pantalla: el que eligió la persona o, si no, el primero con horas. */
export function resolveSelectedDate(
  chosenIsoDate: string | null,
  days: readonly DayOption[],
): string | null {
  return chosenIsoDate ?? days.find((day) => day.hasSlots)?.isoDate ?? null;
}
