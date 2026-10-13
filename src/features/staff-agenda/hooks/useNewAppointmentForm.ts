import { useState } from 'react';

import {
  DEFAULT_CENTER_TIME_ZONE,
  useAvailableSlots,
  useCenterServices,
  type SlotOption,
} from '@/features/booking';
import type {
  GroupOptionsResponseDtoRoomsItem,
  PlacementOptionsResponseDto,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';
import { formatTime24h } from '@/shared/lib/format/format-time';

import { useCenterStaff } from './useCenterStaff';
import { useHasCenterRooms } from './useHasCenterRooms';
import { useGroupOptions } from './useGroupOptions';
import { usePlacementOptions } from './usePlacementOptions';
import type { AgendaStaffMember } from '../model/center-agenda-summary';
import { getTodayIsoDate } from '../model/agenda-date';
import { listServicesOfStaff, resolveServiceId } from '../model/staff-services';
import {
  findFreeRooms,
  listSlotsWithFreeRoom,
  resolveRoomId,
  type AppointmentMode,
  type FreeRoom,
  type JoinableGroup,
} from '../model/placement-options';

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
  /** A quiénes se les pone la cita: varias solo en grupal (o al apuntarse a una clase). */
  clients: ChosenClient[];
  staff: AgendaStaffMember[];
  staffMembershipId: string | null;
  serviceId: string | null;
  services: ReturnType<typeof useCenterServices>;
  /** Los servicios que da el profesional elegido (el resto no se ofrecen). */
  staffServices: ServiceListResponseDtoServicesItem[];
  /** El día para el que se busca disponibilidad. */
  isoDate: string;
  /** Elige el día de la cita (desde el calendario). */
  selectDate: (isoDate: string) => void;
  /** El centro tiene salas: se elige si la cita es privada o grupal. */
  hasCenterRooms: boolean;
  slots: SlotOption[];
  timeZone: string;
  selectedStartsAt: string | null;
  /** El profesional tiene salas: la cita puede ser privada o grupal y lleva sala. */
  hasRooms: boolean;
  mode: AppointmentMode;
  freeRooms: readonly FreeRoom[];
  roomId: string | null;
  /** Grupos de ese día con plazas libres, a los que se puede apuntar a más gente. */
  joinableGroups: readonly JoinableGroup[];
  joinSessionId: string | null;
  /** Marca o desmarca a una persona; si no caben varias, elegir a otra sustituye a la anterior. */
  toggleClient: (client: ChosenClient, options: { canChooseSeveral: boolean }) => void;
  clearClients: () => void;
  selectStaff: (staffMembershipId: string) => void;
  selectService: (serviceId: string) => void;
  selectSlot: (slot: SlotOption) => void;
  selectMode: (mode: AppointmentMode) => void;
  selectRoom: (roomId: string) => void;
  selectJoinSession: (sessionId: string) => void;
  /** Cita grupal: cada sala con cada profesor que da el servicio y sus horas libres. */
  groupRoomOptions: GroupOptionsResponseDtoRoomsItem[];
  /** En grupal el profesor lo define la sala: se elige la hora de uno de los profesores de la sala. */
  selectGroupSlot: (pick: GroupSlotPick) => void;
}

export interface GroupSlotPick {
  staffMembershipId: string;
  roomId: string;
  startsAt: string;
}

interface StaffDaySlots {
  slots: SlotOption[];
  timeZone: string;
}

/** Los huecos libres de la persona elegida ese día, para el servicio elegido. */
function useStaffDaySlots(request: {
  serviceId: string | null;
  staffMembershipId: string | null;
  isoDate: string;
}): StaffDaySlots {
  const { serviceId, staffMembershipId, isoDate } = request;
  const availability = useAvailableSlots({
    serviceId: serviceId ?? '',
    fromDate: isoDate,
    toDate: isoDate,
    staffMembershipId: staffMembershipId ?? undefined,
    stepMinutes: APPOINTMENT_STEP_MINUTES,
  });
  const canListSlots = serviceId !== null && staffMembershipId !== null;

  return {
    slots: canListSlots
      ? (availability.data?.days.find((day) => day.date === isoDate)?.slots ?? [])
      : [],
    timeZone: availability.data?.timezone ?? DEFAULT_CENTER_TIME_ZONE,
  };
}

/** Hora, tipo de cita, sala y grupo elegidos; cambiar de profesional o servicio los borra. */
function useWhenChoices() {
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [mode, setMode] = useState<AppointmentMode>('private');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinSessionId, setJoinSessionId] = useState<string | null>(null);

  return {
    startsAt,
    mode,
    roomId,
    joinSessionId,
    clearWhen: () => {
      setStartsAt(null);
      setJoinSessionId(null);
    },
    selectSlot: (slot: SlotOption) => {
      setStartsAt(slot.startsAt);
      setJoinSessionId(null);
    },
    selectMode: (nextMode: AppointmentMode) => {
      setMode(nextMode);
      setJoinSessionId(null);
      setStartsAt(null);
      setRoomId(null);
    },
    selectGroupSlot: (startsAtOfGroup: string, nextRoomId: string) => {
      setStartsAt(startsAtOfGroup);
      setRoomId(nextRoomId);
      setJoinSessionId(null);
    },
    selectRoom: setRoomId,
    selectJoinSession: (sessionId: string) => {
      setJoinSessionId(sessionId);
      setStartsAt(null);
    },
  };
}

/** Marca o desmarca a una persona; sin varias personas permitidas, la elegida sustituye a la anterior. */
export function toggleChosenClient(
  current: readonly ChosenClient[],
  chosen: ChosenClient,
  canChooseSeveral: boolean,
): ChosenClient[] {
  const isChosen = current.some((client) => client.membershipId === chosen.membershipId);
  if (isChosen) return current.filter((client) => client.membershipId !== chosen.membershipId);
  return canChooseSeveral ? [...current, chosen] : [chosen];
}

/** Lo elegido a mano; la hora, la sala y el grupo se calculan a partir de ello. */
function useChoices() {
  const [clients, setClients] = useState<ChosenClient[]>([]);
  const [staffMembershipId, setStaffMembershipId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const { clearWhen, selectGroupSlot, selectMode, ...when } = useWhenChoices();

  return {
    ...when,
    selectMode: (nextMode: AppointmentMode) => {
      selectMode(nextMode);
      setStaffMembershipId(null);
      // Una cita privada es de una sola persona: se queda la primera.
      if (nextMode === 'private') setClients((current) => current.slice(0, 1));
    },
    selectGroupSlot: (pick: GroupSlotPick) => {
      setStaffMembershipId(pick.staffMembershipId);
      selectGroupSlot(pick.startsAt, pick.roomId);
    },
    clients,
    staffMembershipId,
    serviceId,
    toggleClient: (chosen: ChosenClient, options: { canChooseSeveral: boolean }) => {
      setClients((current) => toggleChosenClient(current, chosen, options.canChooseSeveral));
    },
    clearClients: () => {
      setClients([]);
    },
    selectStaff: (nextStaffMembershipId: string) => {
      setStaffMembershipId(nextStaffMembershipId);
      clearWhen();
    },
    selectService: (nextServiceId: string) => {
      setServiceId(nextServiceId);
      clearWhen();
    },
  };
}

interface RoomPlacement {
  /** El profesional tiene salas: las horas, las salas y los grupos salen de aquí. */
  hasRooms: boolean;
  roomSlots: SlotOption[];
  options: PlacementOptionsResponseDto | undefined;
}

/** Lo libre del profesional elegido ese día con sus salas; sin salas, el centro sigue como siempre. */
function useRoomPlacement(request: {
  serviceId: string | null;
  staffMembershipId: string | null;
  isoDate: string;
  staff: readonly AgendaStaffMember[];
}): RoomPlacement {
  const options = usePlacementOptions(request);
  const chosenStaff = request.staff.find(
    (member) => member.membershipId === request.staffMembershipId,
  );
  if (options === undefined || chosenStaff === undefined || !options.hasUsableRooms) {
    return { hasRooms: false, roomSlots: [], options: undefined };
  }
  return { hasRooms: true, roomSlots: listSlotsWithFreeRoom(options, chosenStaff), options };
}

/** El día elegido: empieza en el de la agenda desde la que se abrió, o en hoy. */
function useAppointmentDay(initialIsoDate: string) {
  const [todayIsoDate] = useState(() => getTodayIsoDate(new Date(), DEFAULT_CENTER_TIME_ZONE));
  // Un día que ya pasó no vale: si se abre desde una agenda antigua, se empieza hoy.
  const [isoDate, setIsoDate] = useState(() =>
    initialIsoDate !== '' && initialIsoDate >= todayIsoDate ? initialIsoDate : todayIsoDate,
  );

  return {
    isoDate,
    selectDate: (nextIsoDate: string) => {
      if (nextIsoDate >= todayIsoDate) setIsoDate(nextIsoDate);
    },
  };
}

/** El equipo, los servicios del profesional elegido y el servicio de la cita. */
function useStaffAndServices(choices: {
  staffMembershipId: string | null;
  serviceId: string | null;
}) {
  const staff = useCenterStaff();
  const services = useCenterServices();
  const allServices = services.data?.services ?? [];
  const staffServices = listServicesOfStaff(allServices, choices.staffMembershipId);

  return {
    staff,
    services,
    staffServices,
    serviceId: resolveServiceId({
      allServices,
      staffServices,
      chosenServiceId: choices.serviceId,
    }),
  };
}

/** Lo elegido (cliente, profesional, servicio, hora, sala) y lo libre de ese profesional ese día. */
export function useNewAppointmentForm({
  isoDate: initialIsoDate,
  presetTime,
}: NewAppointmentRequest): NewAppointmentForm {
  const choices = useChoices();
  const day = useAppointmentDay(initialIsoDate);
  const catalog = useStaffAndServices(choices);
  const { staffMembershipId } = choices;
  const { serviceId, staff } = catalog;
  const lookup = { serviceId, staffMembershipId, isoDate: day.isoDate };
  const daySlots = useStaffDaySlots(lookup);
  const placement = useRoomPlacement({ ...lookup, staff });
  const groupRoomOptions = useGroupOptions({
    serviceId,
    isoDate: day.isoDate,
    isGroupMode: choices.mode === 'group',
  });
  const isGroupMode = choices.mode === 'group';
  const slots = placement.hasRooms ? placement.roomSlots : daySlots.slots;
  const presetSlot = slots.find(
    (slot) => formatTime24h(slot.startsAt, daySlots.timeZone) === presetTime,
  );
  const startsAt =
    choices.joinSessionId === null ? (choices.startsAt ?? presetSlot?.startsAt ?? null) : null;
  const freeRooms = isGroupMode ? [] : findFreeRooms(placement.options, startsAt);

  return {
    ...choices,
    ...day,
    ...catalog,
    hasCenterRooms: useHasCenterRooms(),
    slots,
    timeZone: daySlots.timeZone,
    selectedStartsAt: startsAt,
    hasRooms: placement.hasRooms,
    freeRooms,
    roomId: isGroupMode ? choices.roomId : resolveRoomId(freeRooms, choices.roomId),
    groupRoomOptions,
    joinableGroups: isGroupMode ? groupRoomOptions.flatMap((entry) => entry.groupSessions) : [],
  };
}
