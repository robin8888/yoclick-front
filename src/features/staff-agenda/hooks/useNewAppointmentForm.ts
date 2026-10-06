import { useState } from 'react';

import {
  DEFAULT_CENTER_TIME_ZONE,
  useAvailableSlots,
  useCenterServices,
  type SlotOption,
} from '@/features/booking';
import { useMyCenters } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';
import { formatTime24h } from '@/shared/lib/format/format-time';

/** Las citas de la agenda empiezan en cualquier cuarto de hora, no solo a la hora en punto. */
const APPOINTMENT_STEP_MINUTES = 15;

export interface ChosenClient {
  membershipId: string;
  fullName: string;
}

interface NewAppointmentRequest {
  isoDate: string;
  /** «10:00»: la hora del hueco desde el que se abrió la pantalla. */
  presetTime: string | undefined;
}

export interface NewAppointmentForm {
  client: ChosenClient | null;
  serviceId: string | null;
  services: ReturnType<typeof useCenterServices>;
  slots: SlotOption[];
  timeZone: string;
  selectedStartsAt: string | null;
  selectClient: (client: ChosenClient) => void;
  clearClient: () => void;
  selectService: (serviceId: string) => void;
  selectSlot: (slot: SlotOption) => void;
}

function useOwnMembershipId(): string | undefined {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const { data: myCenters } = useMyCenters();
  return myCenters?.memberships.find((membership) => membership.centerId === activeCenterId)
    ?.membershipId;
}

interface OwnDaySlots {
  slots: SlotOption[];
  timeZone: string;
}

/** Los huecos libres de quien está en su agenda ese día, para el servicio elegido. */
function useOwnDaySlots(serviceId: string | null, isoDate: string): OwnDaySlots {
  const ownMembershipId = useOwnMembershipId();
  const availability = useAvailableSlots({
    serviceId: serviceId ?? '',
    fromDate: isoDate,
    toDate: isoDate,
    staffMembershipId: ownMembershipId,
    stepMinutes: APPOINTMENT_STEP_MINUTES,
  });
  const canListSlots = serviceId !== null && ownMembershipId !== undefined;

  return {
    slots: canListSlots
      ? (availability.data?.days.find((day) => day.date === isoDate)?.slots ?? [])
      : [],
    timeZone: availability.data?.timezone ?? DEFAULT_CENTER_TIME_ZONE,
  };
}

/** Lo elegido (cliente, servicio, hora) y los huecos libres de quien está en la agenda. */
export function useNewAppointmentForm({
  isoDate,
  presetTime,
}: NewAppointmentRequest): NewAppointmentForm {
  const [client, setClient] = useState<ChosenClient | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [chosenStartsAt, setChosenStartsAt] = useState<string | null>(null);
  const { slots, timeZone } = useOwnDaySlots(serviceId, isoDate);
  const presetSlot = slots.find((slot) => formatTime24h(slot.startsAt, timeZone) === presetTime);

  return {
    client,
    serviceId,
    services: useCenterServices(),
    slots,
    timeZone,
    selectedStartsAt: chosenStartsAt ?? presetSlot?.startsAt ?? null,
    selectClient: setClient,
    clearClient: () => {
      setClient(null);
    },
    selectService: (nextServiceId) => {
      setServiceId(nextServiceId);
      setChosenStartsAt(null);
    },
    selectSlot: (slot) => {
      setChosenStartsAt(slot.startsAt);
    },
  };
}
