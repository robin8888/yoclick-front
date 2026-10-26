import { z } from 'zod';

import type {
  CreateRoomRequestDto,
  CreateRoomRequestDtoPlace,
  RoomListResponseDtoRoomsItem,
  UpdateRoomRequestDto,
} from '@/shared/api/generated/model';
import { addressValueSchema, EMPTY_ADDRESS, type AddressValue } from '@/features/address';
import { i18n } from '@/shared/i18n';
import type { MapPoint } from '@/shared/lib/location-link';

// Mismos límites que `CreateRoomRequestDto` (docs/api/openapi.yaml).
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 80;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 500;
export const DEFAULT_ROOM_CAPACITY_TEXT = '10';
/** El texto de «ningún profesor fijo»: cualquiera del equipo puede usar la sala. */
export const ANY_TEACHER_VALUE = '';
/** El texto de «ningún servicio fijo»: en el espacio se programa cualquier servicio. */
export const ANY_SERVICE_VALUE = '';

/** Si la sala es un espacio exterior: su dirección y el punto exacto fijado con el GPS o un enlace. */
export interface RoomPlaceDraft {
  isOutdoor: boolean;
  address: AddressValue;
  pin: MapPoint | null;
}

export const EMPTY_ROOM_PLACE: RoomPlaceDraft = {
  isOutdoor: false,
  address: EMPTY_ADDRESS,
  pin: null,
};

export const roomFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, { error: () => i18n.t('centerAdmin.rooms.nameRequired') })
    .max(MAX_NAME_LENGTH, { error: () => i18n.t('centerAdmin.rooms.nameTooLong') }),
  capacity: z
    .string()
    .trim()
    .refine(
      (text) => {
        const capacity = Number(text);
        return Number.isInteger(capacity) && capacity >= MIN_CAPACITY && capacity <= MAX_CAPACITY;
      },
      { error: () => i18n.t('centerAdmin.rooms.capacityInvalid') },
    ),
  /** Quien da clase en la sala; `ANY_TEACHER_VALUE` si la puede usar cualquiera. */
  staffMembershipId: z.string(),
  /** Los servicios que se dan en la sala. */
  serviceIds: z.array(z.string()),
  /** El único servicio que admite el espacio; `ANY_SERVICE_VALUE` si admite cualquiera. */
  fixedServiceId: z.string(),
  place: z.object({
    isOutdoor: z.boolean(),
    address: addressValueSchema,
    pin: z.object({ latitude: z.number(), longitude: z.number() }).nullable(),
  }),
});
export type RoomFormValues = z.infer<typeof roomFormSchema>;

export function buildEmptyRoomForm(): RoomFormValues {
  return {
    name: '',
    capacity: DEFAULT_ROOM_CAPACITY_TEXT,
    staffMembershipId: ANY_TEACHER_VALUE,
    serviceIds: [],
    fixedServiceId: ANY_SERVICE_VALUE,
    place: EMPTY_ROOM_PLACE,
  };
}

export function buildRoomForm(room: RoomListResponseDtoRoomsItem): RoomFormValues {
  return {
    name: room.name,
    capacity: String(room.capacity),
    staffMembershipId: room.staff?.membershipId ?? ANY_TEACHER_VALUE,
    serviceIds: room.services.map(({ id }) => id),
    fixedServiceId: room.fixedService?.id ?? ANY_SERVICE_VALUE,
    place: buildRoomPlaceDraft(room.place),
  };
}

function buildRoomPlaceDraft(place: RoomListResponseDtoRoomsItem['place']): RoomPlaceDraft {
  if (place === null) return EMPTY_ROOM_PLACE;
  return {
    isOutdoor: true,
    address: { text: place.address ?? '', latitude: place.latitude, longitude: place.longitude },
    pin: null,
  };
}

/** Lo que se envía: `null` si la sala es del centro; si es exterior, su dirección y su punto. */
export function toRoomPlaceRequest(place: RoomPlaceDraft): CreateRoomRequestDtoPlace {
  if (!place.isOutdoor) return null;
  const addressText = place.address.text.trim();
  const { latitude, longitude } = place.pin ?? place.address;
  const hasPoint = latitude !== null && longitude !== null;
  return {
    address: addressText === '' ? null : addressText,
    latitude: hasPoint ? latitude : null,
    longitude: hasPoint ? longitude : null,
  };
}

function toStaffMembershipId(formValue: string): string | null {
  return formValue === ANY_TEACHER_VALUE ? null : formValue;
}

export function mapRoomFormToCreateRequest(formValues: RoomFormValues): CreateRoomRequestDto {
  return {
    name: formValues.name.trim(),
    capacity: Number(formValues.capacity),
    staffMembershipId: toStaffMembershipId(formValues.staffMembershipId),
    serviceIds: formValues.serviceIds,
    serviceId: formValues.fixedServiceId === ANY_SERVICE_VALUE ? null : formValues.fixedServiceId,
    place: toRoomPlaceRequest(formValues.place),
  };
}

export function mapRoomFormToUpdateRequest(formValues: RoomFormValues): UpdateRoomRequestDto {
  return mapRoomFormToCreateRequest(formValues);
}
