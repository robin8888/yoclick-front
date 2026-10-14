import { z } from 'zod';

import type {
  CreateRoomBlockRequestDto,
  RoomBlockListResponseDtoBlocksItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import {
  addDaysToIsoDate,
  formatShortDate,
  formatTime24h,
  zonedDateTimeToUtc,
} from '@/shared/lib/format';

import { parsePriceInCents } from './rate-form';
import { isTimeRangeOrdered } from './schedule-form';

export const ROOM_BLOCK_REASONS = ['rental', 'maintenance', 'event', 'other'] as const;
export type RoomBlockReason = (typeof ROOM_BLOCK_REASONS)[number];

// Mismos límites que `CreateRoomBlockRequestDto` (docs/api/openapi.yaml).
const MAX_NOTE_LENGTH = 200;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const DEFAULT_STARTS_AT_TIME = '09:00';
const DEFAULT_ENDS_AT_TIME = '14:00';
/** Los bloqueos se listan hasta donde llega la materialización de los horarios (8 semanas). */
const BLOCK_LIST_HORIZON_DAYS = 56;

export const roomBlockFormSchema = z
  .object({
    date: z
      .string()
      .regex(ISO_DATE_PATTERN, { error: () => i18n.t('centerAdmin.roomBlocks.dateRequired') }),
    startsAtTime: z.string().regex(TIME_PATTERN),
    endsAtTime: z.string().regex(TIME_PATTERN),
    reason: z.enum(ROOM_BLOCK_REASONS),
    note: z
      .string()
      .trim()
      .max(MAX_NOTE_LENGTH, { error: () => i18n.t('centerAdmin.roomBlocks.noteTooLong') }),
    /** Quien alquila (persona registrada); vacío = bloqueo sin más. Solo cuenta con motivo `rental`. */
    renterMembershipId: z.string(),
    renterName: z.string(),
    /** Euros del alquiler; vacío = sin precio. */
    price: z.string(),
  })
  .refine((form) => isTimeRangeOrdered(form.startsAtTime, form.endsAtTime), {
    error: () => i18n.t('centerAdmin.roomBlocks.timeOrder'),
    path: ['endsAtTime'],
  })
  .refine((form) => form.price.trim() === '' || parsePriceInCents(form.price) !== null, {
    error: () => i18n.t('centerAdmin.roomBlocks.priceInvalid'),
    path: ['price'],
  })
  .refine((form) => form.price.trim() === '' || form.renterMembershipId !== '', {
    error: () => i18n.t('centerAdmin.roomBlocks.priceNeedsRenter'),
    path: ['price'],
  });
export type RoomBlockFormValues = z.infer<typeof roomBlockFormSchema>;

export function buildEmptyRoomBlockForm(todayIsoDate: string): RoomBlockFormValues {
  return {
    date: todayIsoDate,
    startsAtTime: DEFAULT_STARTS_AT_TIME,
    endsAtTime: DEFAULT_ENDS_AT_TIME,
    reason: 'rental',
    note: '',
    renterMembershipId: '',
    renterName: '',
    price: '',
  };
}

/** Las horas locales del centro pasan a instantes UTC, que es lo que guarda el servidor. */
export function mapRoomBlockFormToRequest(
  formValues: RoomBlockFormValues,
  timeZone: string,
): CreateRoomBlockRequestDto {
  const priceCents = parsePriceInCents(formValues.price);
  const isRentedToSomeone = formValues.reason === 'rental' && formValues.renterMembershipId !== '';
  return {
    startsAt: zonedDateTimeToUtc(formValues.date, formValues.startsAtTime, timeZone).toISOString(),
    endsAt: zonedDateTimeToUtc(formValues.date, formValues.endsAtTime, timeZone).toISOString(),
    reason: formValues.reason,
    ...(formValues.note === '' ? {} : { note: formValues.note }),
    ...(isRentedToSomeone ? { renterMembershipId: formValues.renterMembershipId } : {}),
    ...(isRentedToSomeone && priceCents !== null && priceCents > 0 ? { priceCents } : {}),
  };
}

/** «Alquiler», «Mantenimiento», «Evento» u «Otro». */
export function describeBlockReason(reason: RoomBlockReason): string {
  return i18n.t(`centerAdmin.roomBlocks.reason.${reason}`);
}

/** «sáb 25 oct · 10:00–14:00» o, si cruza la medianoche, «sáb 25 oct 22:00 – dom 26 oct 02:00». */
export function describeBlockWhen(
  block: Pick<RoomBlockListResponseDtoBlocksItem, 'startsAt' | 'endsAt'>,
  timeZone: string,
): string {
  const startDay = formatShortDate(block.startsAt, timeZone);
  const endDay = formatShortDate(block.endsAt, timeZone);
  const startTime = formatTime24h(block.startsAt, timeZone);
  const endTime = formatTime24h(block.endsAt, timeZone);
  if (startDay === endDay) return `${startDay} · ${startTime}–${endTime}`;
  return `${startDay} ${startTime} – ${endDay} ${endTime}`;
}

/** Desde hoy hasta ocho semanas después: lo que se enseña en la lista de bloqueos. */
export function buildBlockListRange(todayIsoDate: string): { from: string; to: string } {
  return { from: todayIsoDate, to: addDaysToIsoDate(todayIsoDate, BLOCK_LIST_HORIZON_DAYS) };
}
