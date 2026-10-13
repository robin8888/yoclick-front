import { useTickingNow } from './useTickingNow';
import { formatTime24h } from '../lib/format/format-time';
import {
  findHourOfSlot,
  groupSlotsByHour,
  keepFutureSlots,
  type HourGroup,
} from '../lib/slot-hours';

/** Las horas que pasan desaparecen solas; con mirar cada minuto basta. */
const NOW_REFRESH_MS = 60_000;

export interface SlotWheelModel<TSlot extends { startsAt: string }> {
  /** Solo los huecos que aún no han empezado. */
  futureSlots: TSlot[];
  hours: HourGroup[];
  activeHour: number | null;
  chosenTimeLabel: string | null;
}

/**
 * Lo que necesitan las ruedas de hora: los huecos libres y futuros agrupados por hora, la hora
 * activa y la hora elegida escrita («10:30») en la zona del centro.
 */
export function useSlotWheelModel<TSlot extends { startsAt: string }>(input: {
  slots: readonly TSlot[];
  timeZone: string;
  selectedStartsAt: string | null;
}): SlotWheelModel<TSlot> {
  const now = useTickingNow(NOW_REFRESH_MS);
  const futureSlots = keepFutureSlots(input.slots, now);
  const hours = groupSlotsByHour(futureSlots, input.timeZone);

  return {
    futureSlots,
    hours,
    activeHour: findHourOfSlot(input.selectedStartsAt, input.timeZone) ?? hours[0]?.hour ?? null,
    chosenTimeLabel:
      input.selectedStartsAt === null
        ? null
        : formatTime24h(input.selectedStartsAt, input.timeZone),
  };
}
