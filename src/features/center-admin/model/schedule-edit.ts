import { z } from 'zod';

import type { UpdateScheduleSeriesRequestDto } from '@/shared/api/generated/model';
import { addressValueSchema } from '@/features/address';
import { i18n } from '@/shared/i18n';

import {
  isTimeRangeOrdered,
  isValidCapacityText,
  NO_END_VALUE,
  NO_ROOM_VALUE,
} from './schedule-form';
import { buildLocationDraft, isSameLocationRequest, toLocationRequest } from './location-draft';
import type { ScheduleSeries } from './schedule-summary';

const MAX_LABEL_LENGTH = 80;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export const scheduleEditSchema = z
  .object({
    label: z
      .string()
      .trim()
      .max(MAX_LABEL_LENGTH, { error: () => i18n.t('centerAdmin.schedules.labelTooLong') }),
    capacity: z
      .string()
      .trim()
      .refine(isValidCapacityText, {
        error: () => i18n.t('centerAdmin.schedules.capacityInvalid'),
      }),
    startsAtTime: z.string().regex(TIME_PATTERN),
    endsAtTime: z.string().regex(TIME_PATTERN),
    /** No se edita: sirve para comprobar que el fin no queda antes del inicio. */
    startsOn: z.string(),
    endsOn: z.string().refine((text) => text === NO_END_VALUE || ISO_DATE_PATTERN.test(text), {
      error: () => i18n.t('centerAdmin.schedules.endsOnInvalid'),
    }),
    roomId: z.string(),
    staffMembershipId: z
      .string()
      .min(1, { error: () => i18n.t('centerAdmin.schedules.teacherRequired') }),
    location: z.object({ isOutside: z.boolean(), name: z.string(), address: addressValueSchema }),
  })
  .refine((form) => isTimeRangeOrdered(form.startsAtTime, form.endsAtTime), {
    error: () => i18n.t('centerAdmin.schedules.timeOrder'),
    path: ['endsAtTime'],
  })
  .refine((form) => !form.location.isOutside || form.location.name.trim() !== '', {
    error: () => i18n.t('centerAdmin.location.nameRequired'),
    path: ['location', 'name'],
  })
  .refine((form) => form.endsOn === NO_END_VALUE || form.endsOn >= form.startsOn, {
    error: () => i18n.t('centerAdmin.schedules.periodOrder'),
    path: ['endsOn'],
  });
export type ScheduleEditValues = z.infer<typeof scheduleEditSchema>;

/** Todos los días de una serie comparten hora: la del primero vale para el formulario. */
function readSeriesTimes(series: ScheduleSeries): { startsAtTime: string; endsAtTime: string } {
  const firstDay = series.days[0];
  return {
    startsAtTime: firstDay?.startsAtTime ?? '',
    endsAtTime: firstDay?.endsAtTime ?? '',
  };
}

export function buildScheduleEditForm(series: ScheduleSeries): ScheduleEditValues {
  return {
    label: series.label ?? '',
    capacity: String(series.capacity),
    ...readSeriesTimes(series),
    startsOn: series.startsOn,
    endsOn: series.endsOn ?? NO_END_VALUE,
    roomId: series.room?.id ?? NO_ROOM_VALUE,
    staffMembershipId: series.staff?.membershipId ?? '',
    location: buildLocationDraft(series.location),
  };
}

function toNullableText(text: string): string | null {
  return text === '' ? null : text;
}

/** El profesor solo se envía si se ha elegido uno distinto; un alquiler sigue sin profesor. */
function readTeacherChange(
  formValues: ScheduleEditValues,
  series: ScheduleSeries,
): { staffMembershipId?: string } {
  const { staffMembershipId } = formValues;
  const isUnchanged = staffMembershipId === (series.staff?.membershipId ?? '');
  return isUnchanged || staffMembershipId === '' ? {} : { staffMembershipId };
}

/** Solo lo que cambia: el servidor rechaza una edición vacía y no toca lo que no se envía. */
export function mapScheduleEditToUpdateRequest(
  formValues: ScheduleEditValues,
  series: ScheduleSeries,
): UpdateScheduleSeriesRequestDto {
  const times = readSeriesTimes(series);
  const label = toNullableText(formValues.label);
  const endsOn = toNullableText(formValues.endsOn);
  const roomId = toNullableText(formValues.roomId);
  const location = toLocationRequest(formValues.location);
  const hasTimeChange =
    formValues.startsAtTime !== times.startsAtTime || formValues.endsAtTime !== times.endsAtTime;
  return {
    ...(label === series.label ? {} : { label }),
    ...(Number(formValues.capacity) === series.capacity
      ? {}
      : { capacity: Number(formValues.capacity) }),
    ...(hasTimeChange
      ? { startsAtTime: formValues.startsAtTime, endsAtTime: formValues.endsAtTime }
      : {}),
    ...(endsOn === series.endsOn ? {} : { endsOn }),
    ...(roomId === (series.room?.id ?? null) ? {} : { roomId }),
    ...readTeacherChange(formValues, series),
    ...(isSameLocationRequest(location, series.location) ? {} : { location }),
  };
}

export function hasScheduleChanges(request: UpdateScheduleSeriesRequestDto): boolean {
  return Object.keys(request).length > 0;
}
