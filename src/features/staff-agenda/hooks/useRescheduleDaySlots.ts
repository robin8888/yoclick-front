import { useState } from 'react';

import { DEFAULT_CENTER_TIME_ZONE, useAvailableSlots, type SlotOption } from '@/features/booking';

import { shiftIsoDate } from '../model/agenda-date';

/** Las citas de la agenda empiezan en cualquier cuarto de hora, no solo a la hora en punto. */
const APPOINTMENT_STEP_MINUTES = 15;

interface RescheduleDaySlotsRequest {
  serviceId: string;
  staffMembershipId: string;
  initialIsoDate: string;
}

export interface RescheduleDaySlots {
  isoDate: string;
  slots: SlotOption[];
  timeZone: string;
  selectedStartsAt: string | null;
  selectSlot: (slot: SlotOption) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

/** Los huecos libres de quien da la cita en el día elegido; cambiar de día borra la hora elegida. */
export function useRescheduleDaySlots({
  serviceId,
  staffMembershipId,
  initialIsoDate,
}: RescheduleDaySlotsRequest): RescheduleDaySlots {
  const [isoDate, setIsoDate] = useState(initialIsoDate);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null);
  const availability = useAvailableSlots({
    serviceId,
    fromDate: isoDate,
    toDate: isoDate,
    staffMembershipId,
    stepMinutes: APPOINTMENT_STEP_MINUTES,
  });

  function moveDay(dayOffset: number): void {
    setIsoDate((currentDate) => shiftIsoDate(currentDate, dayOffset) ?? currentDate);
    setSelectedStartsAt(null);
  }

  return {
    isoDate,
    slots: availability.data?.days.find((day) => day.date === isoDate)?.slots ?? [],
    timeZone: availability.data?.timezone ?? DEFAULT_CENTER_TIME_ZONE,
    selectedStartsAt,
    selectSlot: (slot) => {
      setSelectedStartsAt(slot.startsAt);
    },
    goToPreviousDay: () => {
      moveDay(-1);
    },
    goToNextDay: () => {
      moveDay(1);
    },
  };
}
