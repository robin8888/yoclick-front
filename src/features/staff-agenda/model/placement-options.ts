import type {
  PlacementOptionsResponseDto,
  PlacementOptionsResponseDtoGroupSessionsItem,
  PlacementOptionsResponseDtoOpenSlotsItemFreeRoomsItem,
} from '@/shared/api/generated/model';

/** Privada: una persona con el profesor. Grupal: varias a la vez hasta el aforo de la sala. */
export type AppointmentMode = 'private' | 'group';

export type FreeRoom = PlacementOptionsResponseDtoOpenSlotsItemFreeRoomsItem;
export type JoinableGroup = PlacementOptionsResponseDtoGroupSessionsItem;

interface StaffOfDay {
  membershipId: string;
  fullName: string;
}

export interface RoomSlot {
  startsAt: string;
  staffMembershipId: string;
  staffName: string;
}

/**
 * Las horas en las que el profesional está libre y además hay alguna sala libre: sin sala no se
 * puede dar la clase aunque la persona esté libre.
 */
export function listSlotsWithFreeRoom(
  options: PlacementOptionsResponseDto,
  staff: StaffOfDay,
): RoomSlot[] {
  return options.openSlots
    .filter((slot) => slot.freeRooms.length > 0)
    .map((slot) => ({
      startsAt: slot.startsAt,
      staffMembershipId: staff.membershipId,
      staffName: staff.fullName,
    }));
}

/** Las salas libres a una hora; vacío si no se ha elegido hora. */
export function findFreeRooms(
  options: PlacementOptionsResponseDto | undefined,
  startsAt: string | null,
): readonly FreeRoom[] {
  if (options === undefined || startsAt === null) return [];
  return options.openSlots.find((slot) => slot.startsAt === startsAt)?.freeRooms ?? [];
}

/** La sala elegida si sigue libre a esa hora; si no, la primera libre (o ninguna). */
export function resolveRoomId(
  freeRooms: readonly FreeRoom[],
  chosenRoomId: string | null,
): string | null {
  const chosenRoom = freeRooms.find((room) => room.id === chosenRoomId);
  return chosenRoom?.id ?? freeRooms[0]?.id ?? null;
}

export function countFreeSeats(group: JoinableGroup): number {
  return group.capacity - group.bookedCount;
}
