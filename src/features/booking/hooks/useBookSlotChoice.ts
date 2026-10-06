import { useState } from 'react';

import type { ErrorType } from '@/shared/api/api-mutator';

import type { SlotOption } from '../components/SlotGrid';
import { listBookableDates } from '../model/booking-dates';
import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { buildDayOptions, resolveSelectedDate, type DayOption } from '../model/day-options';
import { useAvailableSlots } from './useAvailableSlots';

const BOOKABLE_DAY_COUNT = 14;

interface BookSlotChoice {
  days: DayOption[];
  timeZone: string;
  selectedIsoDate: string | null;
  slotsOfSelectedDay: SlotOption[];
  selectedSlot: SlotOption | null;
  hasAnySlot: boolean;
  isLoading: boolean;
  error: ErrorType | null;
  refetch: () => void;
  selectDay: (isoDate: string) => void;
  selectSlot: (slot: SlotOption) => void;
}

/** Rango que se pide al servidor: hoy y los 13 días siguientes, en la zona del centro. */
function requestRange(): { fromDate: string; toDate: string } {
  const dates = listBookableDates({
    now: new Date(),
    dayCount: BOOKABLE_DAY_COUNT,
    timeZone: DEFAULT_CENTER_TIME_ZONE,
  });
  return { fromDate: dates[0]?.isoDate ?? '', toDate: dates[dates.length - 1]?.isoDate ?? '' };
}

interface ChosenSlotState {
  chosenIsoDate: string | null;
  chosenStartsAt: string | null;
  selectDay: (isoDate: string) => void;
  selectSlot: (slot: SlotOption) => void;
}

/** Lo único que vive en el móvil: el día y la hora que la persona ha tocado. */
function useChosenSlotState(): ChosenSlotState {
  const [chosenIsoDate, setChosenIsoDate] = useState<string | null>(null);
  const [chosenStartsAt, setChosenStartsAt] = useState<string | null>(null);

  return {
    chosenIsoDate,
    chosenStartsAt,
    selectDay: (isoDate) => {
      setChosenIsoDate(isoDate);
      setChosenStartsAt(null);
    },
    selectSlot: (slot) => {
      setChosenStartsAt(slot.startsAt);
    },
  };
}

/** Días y huecos salen de la respuesta del servidor; aquí solo se combinan con la elección. */
export function useBookSlotChoice(serviceId: string, staffMembershipId?: string): BookSlotChoice {
  const chosen = useChosenSlotState();
  const availability = useAvailableSlots({ serviceId, staffMembershipId, ...requestRange() });
  const serverDays = availability.data?.days ?? [];
  const days = buildDayOptions(serverDays);
  const selectedIsoDate = resolveSelectedDate(chosen.chosenIsoDate, days);
  const slotsOfSelectedDay = serverDays.find((day) => day.date === selectedIsoDate)?.slots ?? [];

  return {
    days,
    timeZone: availability.data?.timezone ?? DEFAULT_CENTER_TIME_ZONE,
    selectedIsoDate,
    slotsOfSelectedDay,
    selectedSlot:
      slotsOfSelectedDay.find((slot) => slot.startsAt === chosen.chosenStartsAt) ?? null,
    hasAnySlot: days.some((day) => day.hasSlots),
    isLoading: availability.isPending,
    error: availability.error,
    refetch: () => void availability.refetch(),
    selectDay: chosen.selectDay,
    selectSlot: chosen.selectSlot,
  };
}
