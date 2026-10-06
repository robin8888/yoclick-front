import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

const TWO_DIGITS = 2;

export interface MinuteOption {
  startsAt: string;
  /** «30». */
  minuteLabel: string;
}

export interface HourGroup {
  hour: number;
  /** «10». */
  hourLabel: string;
  minutes: MinuteOption[];
}

interface DatedSlot {
  startsAt: string;
}

function toTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

/** Reparte los huecos del día por hora para elegir primero la hora y luego los minutos. */
export function groupSlotsByHour(slots: readonly DatedSlot[], timeZone: string): HourGroup[] {
  const groups = new Map<number, HourGroup>();
  for (const slot of slots) {
    const { hour, minute } = getZonedDateParts(slot.startsAt, timeZone);
    const group = groups.get(hour) ?? { hour, hourLabel: toTwoDigits(hour), minutes: [] };
    group.minutes.push({ startsAt: slot.startsAt, minuteLabel: toTwoDigits(minute) });
    groups.set(hour, group);
  }
  return [...groups.values()].sort((first, second) => first.hour - second.hour);
}

/** La hora del hueco elegido en la zona del centro; `null` si no hay ninguno. */
export function findHourOfSlot(startsAt: string | null, timeZone: string): number | null {
  return startsAt === null ? null : getZonedDateParts(startsAt, timeZone).hour;
}
