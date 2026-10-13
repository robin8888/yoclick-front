export interface WheelMinute {
  /** Instante de inicio, ISO: es lo que se devuelve al elegir. */
  startsAt: string;
  /** «30». */
  minuteLabel: string;
}

export interface WheelHour {
  hour: number;
  /** «10». */
  hourLabel: string;
  minutes: readonly WheelMinute[];
}

export interface SlotWheelPickerLabels {
  hours: string;
  minutes: string;
  /** «Hora elegida». */
  chosenTime: string;
  /** «Desliza las ruedas o toca una hora para elegirla». */
  swipeToChoose: string;
  /** «No hay horas libres este día». */
  noSlots: string;
}

export interface SlotWheelPickerProps {
  /** Las horas libres agrupadas por hora; vacío = no hay nada que elegir. */
  hours: readonly WheelHour[];
  /** La hora de la rueda de horas (la del hueco elegido o, si no hay, la primera). */
  activeHour: number | null;
  /** El instante elegido, ISO; `null` mientras no se ha elegido nada. */
  selectedStartsAt: string | null;
  /** «10:30», ya con la zona del centro; `null` si no hay hora elegida. */
  chosenTimeLabel: string | null;
  onSlotSelect: (startsAt: string) => void;
  labels: SlotWheelPickerLabels;
}
