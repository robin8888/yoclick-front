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
  listFreeStartTimes,
  type BusySlot,
  type ClassDraft,
  toOpenRangesByWeekday,
  type ClassRepeat,
} from '../model/create-class';
import { toggleWeekday, type ScheduleWeekday } from '../model/schedule-form';
import { useBusyTimes } from './useBusyTimes';
import { getDeviceTimeZone } from './useCenterTimeZone';
import { useCenterSettings } from './useCenterSettings';
import { useCreateScheduleSeries } from './useCreateScheduleSeries';
import { useRoomList } from './useRoomList';
import { useServiceCatalog } from './useServiceCatalog';

export interface CreateClassForm {
  draft: ClassDraft;
  rooms: readonly RoomListResponseDtoRoomsItem[];
  services: readonly ServiceListResponseDtoServicesItem[];
  /** Quien da el servicio elegido: de entre ellos se elige al profesor. */
  teachers: readonly { membershipId: string; fullName: string }[];
  /** Las horas de inicio libres para los días y la fecha elegidos. */
  freeTimes: readonly string[];
  busy: readonly BusySlot[];
  isCheckingTimes: boolean;
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
  chooseTime: (time: string) => void;
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
  | 'chooseTime'
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
    startsAtTime: null,
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
  const update = (changes: Partial<ClassDraft>): void => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  return {
    draft,
    actions: {
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
      chooseStartsOn: (startsOn) => {
        update({ startsOn });
      },
      chooseTime: (time) => {
        update({ startsAtTime: time });
      },
    },
  };
}

interface Availability {
  freeTimes: string[];
  busy: BusySlot[];
  isCheckingTimes: boolean;
  weekdayOfDate: number;
}

/** Las horas libres para la sala, el profesor, los días y la fecha elegidos, según el servidor. */
function useAvailability(
  draft: ClassDraft,
  service: ServiceListResponseDtoServicesItem | undefined,
): Availability {
  const busyTimes = useBusyTimes({
    roomId: draft.roomId,
    staffMembershipId: draft.staffMembershipId,
  });
  const openingHours = useCenterSettings().data?.openingHours;
  const weekdayOfDate = getWeekdayOfIsoDate(draft.startsOn) ?? 1;
  const weekdays = draft.repeat === 'once' ? [weekdayOfDate] : draft.weekdays;
  const hasPlace =
    service !== undefined && draft.roomId !== null && draft.staffMembershipId !== null;
  const freeTimes = hasPlace
    ? listFreeStartTimes({
        durationMinutes: service.durationMinutes,
        weekdays,
        busy: busyTimes.busy,
        openRanges: toOpenRangesByWeekday(openingHours),
        period: {
          startsOn: draft.startsOn,
          endsOn: draft.repeat === 'once' ? draft.startsOn : null,
        },
      })
    : [];

  return { freeTimes, busy: busyTimes.busy, isCheckingTimes: busyTimes.isLoading, weekdayOfDate };
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

/** El formulario de «Crear clase»: nombre, sala, servicio, profesor del servicio y día y hora libres. */
export function useCreateClassForm(presetRoomId?: string): CreateClassForm {
  const { draft, actions } = useClassDraftState(presetRoomId);
  const rooms = useRoomList().data?.rooms ?? [];
  const services = useServiceCatalog().data?.services ?? [];
  const service = services.find(({ id }) => id === draft.serviceId);
  const availability = useAvailability(draft, service);
  // La hora elegida solo vale mientras siga libre tras cambiar sala, profesor o días.
  const isTimeFree =
    draft.startsAtTime !== null && availability.freeTimes.includes(draft.startsAtTime);
  const checkedDraft = { ...draft, startsAtTime: isTimeFree ? draft.startsAtTime : null };
  const request =
    service === undefined
      ? null
      : buildCreateClassRequest(checkedDraft, service, availability.weekdayOfDate);

  return {
    ...actions,
    ...useSubmission(request),
    draft: checkedDraft,
    rooms,
    services,
    teachers: service?.staff ?? [],
    freeTimes: availability.freeTimes,
    busy: availability.busy,
    isCheckingTimes: availability.isCheckingTimes,
    service,
    canSave: request !== null,
  };
}
