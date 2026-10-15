import { useRouter } from 'expo-router';
import { useState } from 'react';

import type {
  CreateScheduleSeriesRequestDto,
  RoomListResponseDtoRoomsItem,
  ScheduleSeriesWriteResponseDtoSkippedItem,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';
import { getTodayIsoDate, getWeekdayOfIsoDate } from '@/shared/lib/format';

import {
  buildCreateClassRequest,
  findHoursProblem,
  NO_END_DATE,
  resolvePeriod,
  toOpenRangesByWeekday,
  type BusySlot,
  type ClassDraft,
  type ClassRepeat,
  type HoursProblem,
  type OpenRangesByWeekday,
} from '../model/create-class';
import { toggleWeekday, type ScheduleWeekday } from '../model/schedule-form';
import { getEndOfWeeks } from '../model/schedule-week';
import { useBusyTimes } from './useBusyTimes';
import { useCenterSettings } from './useCenterSettings';
import { getDeviceTimeZone } from './useCenterTimeZone';
import { useCreateScheduleSeries } from './useCreateScheduleSeries';
import { useRoomList } from './useRoomList';
import { useServiceCatalog } from './useServiceCatalog';

const DEFAULT_STARTS_AT_TIME = '18:00';
const DEFAULT_ENDS_AT_TIME = '19:00';

export interface CreateClassForm {
  draft: ClassDraft;
  rooms: readonly RoomListResponseDtoRoomsItem[];
  services: readonly ServiceListResponseDtoServicesItem[];
  /** Quien da el servicio elegido: de entre ellos se elige al profesor. */
  teachers: readonly { membershipId: string; fullName: string }[];
  /** Lo que ya ocupa la sala o el profesor, para enseñarlo junto a las horas. */
  busy: readonly BusySlot[];
  /** Los días elegidos (o el de la fecha, si es una sola vez). */
  weekdays: readonly number[];
  /** Por qué las horas elegidas no valen; `null` si valen. */
  hoursProblem: HoursProblem | null;
  /** El horario del centro, o `null` si aún no lo ha configurado. */
  openRanges: OpenRangesByWeekday | null;
  service: ServiceListResponseDtoServicesItem | undefined;
  canSave: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  skipped: ScheduleSeriesWriteResponseDtoSkippedItem[] | null;
  setLabel: (label: string) => void;
  chooseRoom: (roomId: string) => void;
  chooseService: (serviceId: string) => void;
  chooseTeacher: (membershipId: string) => void;
  chooseRepeat: (repeat: ClassRepeat) => void;
  toggleDay: (weekday: ScheduleWeekday) => void;
  chooseStartsOn: (isoDate: string) => void;
  chooseEndsOn: (isoDate: string) => void;
  /** «1 semana», «2 semanas»…; `null` = sin fecha de fin. */
  choosePeriodWeeks: (weekCount: number | null) => void;
  chooseStartsAtTime: (time: string) => void;
  chooseEndsAtTime: (time: string) => void;
  save: () => void;
  clearError: () => void;
  finish: () => void;
}

type DraftActions = Pick<
  CreateClassForm,
  | 'setLabel'
  | 'chooseRoom'
  | 'chooseService'
  | 'chooseTeacher'
  | 'chooseRepeat'
  | 'toggleDay'
  | 'chooseStartsOn'
  | 'chooseEndsOn'
  | 'choosePeriodWeeks'
  | 'chooseStartsAtTime'
  | 'chooseEndsAtTime'
>;

function buildEmptyDraft(todayIsoDate: string, presetRoomId: string | undefined): ClassDraft {
  return {
    label: '',
    roomId: presetRoomId ?? null,
    serviceId: null,
    staffMembershipId: null,
    repeat: 'weekly',
    weekdays: [],
    startsOn: todayIsoDate,
    endsOn: NO_END_DATE,
    startsAtTime: DEFAULT_STARTS_AT_TIME,
    endsAtTime: DEFAULT_ENDS_AT_TIME,
  };
}

type Update = (changes: Partial<ClassDraft>) => void;

function buildPlaceActions(draft: ClassDraft, update: Update): Partial<DraftActions> {
  return {
    setLabel: (label) => {
      update({ label });
    },
    chooseRoom: (roomId) => {
      update({ roomId });
    },
    // El profesor tiene que dar el servicio: al cambiarlo se vuelve a elegir.
    chooseService: (serviceId) => {
      update({ serviceId, staffMembershipId: null });
    },
    chooseTeacher: (staffMembershipId) => {
      update({ staffMembershipId });
    },
    chooseRepeat: (repeat) => {
      update({ repeat });
    },
    toggleDay: (weekday) => {
      update({ weekdays: toggleWeekday(draft.weekdays, weekday) });
    },
  };
}

function buildWhenActions(draft: ClassDraft, update: Update): Partial<DraftActions> {
  return {
    // Si el fin quedaba antes del nuevo inicio, vuelve a «sin fin» hasta que se elija otro.
    chooseStartsOn: (startsOn) => {
      const isEndBefore = draft.endsOn !== NO_END_DATE && draft.endsOn < startsOn;
      update({ startsOn, ...(isEndBefore ? { endsOn: NO_END_DATE } : {}) });
    },
    chooseEndsOn: (endsOn) => {
      update({ endsOn });
    },
    choosePeriodWeeks: (weekCount) => {
      update({
        endsOn: weekCount === null ? NO_END_DATE : getEndOfWeeks(draft.startsOn, weekCount),
      });
    },
    chooseStartsAtTime: (startsAtTime) => {
      update({ startsAtTime });
    },
    chooseEndsAtTime: (endsAtTime) => {
      update({ endsAtTime });
    },
  };
}

/** Lo elegido a mano y las acciones que lo cambian. */
function useClassDraftState(presetRoomId: string | undefined): {
  draft: ClassDraft;
  actions: DraftActions;
} {
  const [draft, setDraft] = useState(() =>
    buildEmptyDraft(getTodayIsoDate(new Date(), getDeviceTimeZone()), presetRoomId),
  );
  const update: Update = (changes) => {
    setDraft((current) => ({ ...current, ...changes }));
  };
  const actions = {
    ...buildPlaceActions(draft, update),
    ...buildWhenActions(draft, update),
  } as DraftActions;

  return { draft, actions };
}

interface Checks {
  weekdays: number[];
  weekdayOfDate: number;
  busy: BusySlot[];
  openRanges: OpenRangesByWeekday | null;
  hoursProblem: HoursProblem | null;
}

/** Los días, lo que ya ocupan la sala y el profesor, el horario del centro y si las horas valen. */
function useChecks(draft: ClassDraft): Checks {
  const busyTimes = useBusyTimes({
    roomId: draft.roomId,
    staffMembershipId: draft.staffMembershipId,
  });
  const openRanges = toOpenRangesByWeekday(useCenterSettings().data?.openingHours);
  const weekdayOfDate = getWeekdayOfIsoDate(draft.startsOn) ?? 1;
  const weekdays = draft.repeat === 'once' ? [weekdayOfDate] : [...draft.weekdays];
  const hoursProblem = findHoursProblem({
    startsAtTime: draft.startsAtTime,
    endsAtTime: draft.endsAtTime,
    weekdays,
    busy: busyTimes.busy,
    period: resolvePeriod(draft),
    openRanges,
  });

  return { weekdays, weekdayOfDate, busy: busyTimes.busy, openRanges, hoursProblem };
}

type Submission = Pick<
  CreateClassForm,
  'isSaving' | 'errorMessage' | 'skipped' | 'save' | 'clearError' | 'finish'
>;

/** Guardar la clase: vuelve atrás o enseña las sesiones que el servidor no pudo crear. */
function useSubmission(request: CreateScheduleSeriesRequestDto | null): Submission {
  const router = useRouter();
  const creation = useCreateScheduleSeries();
  const [skipped, setSkipped] = useState<ScheduleSeriesWriteResponseDtoSkippedItem[] | null>(null);

  return {
    isSaving: creation.isCreating,
    errorMessage: creation.errorMessage,
    skipped,
    save: () => {
      if (request === null) return;
      creation.createSeries(request, (result) => {
        if (result.skipped.length === 0) router.back();
        else setSkipped(result.skipped);
      });
    },
    clearError: creation.clearError,
    finish: router.back,
  };
}

/** El formulario de «Crear clase»: nombre, sala, servicio, profesor y cuándo (días, fechas y horas). */
export function useCreateClassForm(presetRoomId?: string): CreateClassForm {
  const { draft, actions } = useClassDraftState(presetRoomId);
  const rooms = useRoomList().data?.rooms ?? [];
  const services = useServiceCatalog().data?.services ?? [];
  const service = services.find(({ id }) => id === draft.serviceId);
  const checks = useChecks(draft);
  const request =
    service === undefined || checks.hoursProblem !== null
      ? null
      : buildCreateClassRequest(draft, service, checks.weekdayOfDate);

  return {
    ...actions,
    ...useSubmission(request),
    draft,
    rooms,
    services,
    teachers: service?.staff ?? [],
    busy: checks.busy,
    weekdays: checks.weekdays,
    hoursProblem: checks.hoursProblem,
    openRanges: checks.openRanges,
    service,
    canSave: request !== null,
  };
}
