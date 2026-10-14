import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { formatTime24h, zonedDateTimeToUtc } from '@/shared/lib/format';

/** Un tramo del día en hora local del centro: «18:00»–«19:00». */
export interface DayTimeRange {
  startsAtTime: string;
  endsAtTime: string;
}

/** Si un espacio se puede separar (alquilar o bloquear) en el tramo elegido. */
export type RoomBlockAvailability =
  | { status: 'available' }
  | { status: 'in_the_past' }
  | { status: 'outside_opening_hours'; openingRanges: DayTimeRange[] }
  | { status: 'occupied'; busyRanges: DayTimeRange[] };

interface RoomBlockAvailabilityRequest {
  agenda: RoomAgendaResponseDto;
  roomId: string;
  date: string;
  startsAtTime: string;
  endsAtTime: string;
  now: Date;
}

function toDayTimeRange(
  occupancy: { startsAt: string; endsAt: string },
  timeZone: string,
): DayTimeRange {
  return {
    startsAtTime: formatTime24h(occupancy.startsAt, timeZone),
    endsAtTime: formatTime24h(occupancy.endsAt, timeZone),
  };
}

function listOccupancyOfRoom(
  agenda: RoomAgendaResponseDto,
  roomId: string,
): { startsAt: string; endsAt: string }[] {
  const room = agenda.rooms.find((candidate) => candidate.id === roomId);
  if (room === undefined) return [];
  const classes = room.sessions.filter((session) => session.cancelledReason === null);
  return [...classes, ...room.blocks];
}

/** Lo que ocupa la sala ese día (clases sin cancelar y bloqueos), por hora, para enseñárselo a quien elige. */
export function listBusyRangesOfRoom(
  agenda: RoomAgendaResponseDto,
  roomId: string,
): DayTimeRange[] {
  return listOccupancyOfRoom(agenda, roomId)
    .map((occupancy) => toDayTimeRange(occupancy, agenda.timezone))
    .sort((first, second) => first.startsAtTime.localeCompare(second.startsAtTime));
}

function isInsideOpeningHours(
  openingRanges: RoomAgendaResponseDto['openingRanges'],
  request: Pick<RoomBlockAvailabilityRequest, 'startsAtTime' | 'endsAtTime'>,
): boolean {
  // Sin horario ese día no se puede saber si está cerrado: no se prohíbe nada por ello.
  if (openingRanges.length === 0) return true;
  return openingRanges.some(
    (range) => range.opensAt <= request.startsAtTime && request.endsAtTime <= range.closesAt,
  );
}

function isOverlappingOccupancy(request: RoomBlockAvailabilityRequest, timeZone: string): boolean {
  const requestedStart = zonedDateTimeToUtc(request.date, request.startsAtTime, timeZone);
  const requestedEnd = zonedDateTimeToUtc(request.date, request.endsAtTime, timeZone);
  return listOccupancyOfRoom(request.agenda, request.roomId).some(
    (occupancy) =>
      new Date(occupancy.startsAt) < requestedEnd && new Date(occupancy.endsAt) > requestedStart,
  );
}

/**
 * Un espacio solo se separa en un tramo futuro, dentro del horario del centro y sin clase ni otro
 * bloqueo en esa sala: el servidor aplica la misma regla, esto avisa antes de enviar.
 */
export function checkRoomBlockAvailability(
  request: RoomBlockAvailabilityRequest,
): RoomBlockAvailability {
  const { agenda } = request;
  const requestedStart = zonedDateTimeToUtc(request.date, request.startsAtTime, agenda.timezone);
  if (requestedStart < request.now) return { status: 'in_the_past' };
  if (!isInsideOpeningHours(agenda.openingRanges, request)) {
    const openingRanges = agenda.openingRanges.map((range) => ({
      startsAtTime: range.opensAt,
      endsAtTime: range.closesAt,
    }));
    return { status: 'outside_opening_hours', openingRanges };
  }
  if (isOverlappingOccupancy(request, agenda.timezone)) {
    return { status: 'occupied', busyRanges: listBusyRangesOfRoom(agenda, request.roomId) };
  }
  return { status: 'available' };
}

/** «18:00–19:00, 20:00–21:00». */
export function describeDayTimeRanges(ranges: readonly DayTimeRange[]): string {
  return ranges.map((range) => `${range.startsAtTime}–${range.endsAtTime}`).join(', ');
}
