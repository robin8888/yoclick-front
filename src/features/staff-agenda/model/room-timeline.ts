import type {
  RoomAgendaResponseDto,
  RoomAgendaResponseDtoRoomsItemBlocksItem,
} from '@/shared/api/generated/model';
import { formatTime24h } from '@/shared/lib/format/format-time';

import type { RoomSession } from './room-agenda';

export type RoomBlock = RoomAgendaResponseDtoRoomsItemBlocksItem;

/** Una clase en la línea temporal: la sala, el servicio, el profesor y cuántas personas faltan. */
export interface TimelineBlock {
  roomId: string;
  roomName: string;
  session: RoomSession;
  /** Personas que faltan para completar el aforo; 0 si está completa, es privada o se canceló. */
  missingCount: number;
}

/** Un tramo en que la sala no está disponible: alquiler, mantenimiento o evento. */
export interface TimelineRoomBlock {
  roomId: string;
  roomName: string;
  block: RoomBlock;
}

export interface TimelineHour {
  /** «17:00». */
  label: string;
  blocks: TimelineBlock[];
  roomBlocks: TimelineRoomBlock[];
}

const MINUTES_PER_HOUR = 60;
/** «17:00»: las dos primeras cifras son la hora. */
const HOUR_DIGITS_LENGTH = 2;

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
}

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(HOUR_DIGITS_LENGTH, '0')}:00`;
}

function readStartHour(startsAt: string, timeZone: string): number {
  return Number(formatTime24h(startsAt, timeZone).slice(0, HOUR_DIGITS_LENGTH));
}

/** Las horas en punto en las que el centro está abierto (la hora en la que abre, incluida). */
function listOpenHours(openingRanges: RoomAgendaResponseDto['openingRanges']): number[] {
  const hours = new Set<number>();
  for (const range of openingRanges) {
    const firstHour = Math.floor(toMinutes(range.opensAt) / MINUTES_PER_HOUR);
    const closesAt = toMinutes(range.closesAt);
    for (let hour = firstHour; hour * MINUTES_PER_HOUR < closesAt; hour += 1) hours.add(hour);
  }
  return [...hours];
}

function countMissing(session: RoomSession): number {
  if (session.mode === 'private' || session.cancelledReason !== null) return 0;
  return Math.max(session.capacity - session.bookedCount, 0);
}

interface HourEntry<TEntry> {
  startHour: number;
  entry: TEntry;
}

function listSessionEntries(agenda: RoomAgendaResponseDto): HourEntry<TimelineBlock>[] {
  return agenda.rooms.flatMap((room) =>
    room.sessions.map((session) => ({
      startHour: readStartHour(session.startsAt, agenda.timezone),
      entry: { roomId: room.id, roomName: room.name, session, missingCount: countMissing(session) },
    })),
  );
}

function listBlockEntries(agenda: RoomAgendaResponseDto): HourEntry<TimelineRoomBlock>[] {
  return agenda.rooms.flatMap((room) =>
    room.blocks.map((block) => ({
      startHour: readStartHour(block.startsAt, agenda.timezone),
      entry: { roomId: room.id, roomName: room.name, block },
    })),
  );
}

function compareByStartAndRoom(
  first: { startsAt: string; roomName: string },
  second: { startsAt: string; roomName: string },
): number {
  return (
    first.startsAt.localeCompare(second.startsAt) || first.roomName.localeCompare(second.roomName)
  );
}

/** Solo lo de una sala (filtro de la leyenda); con `null` se deja todo. */
export function filterTimelineByRoom(
  hours: readonly TimelineHour[],
  roomId: string | null,
): TimelineHour[] {
  if (roomId === null) return [...hours];
  return hours.map((hour) => ({
    ...hour,
    blocks: hour.blocks.filter((block) => block.roomId === roomId),
    roomBlocks: hour.roomBlocks.filter((roomBlock) => roomBlock.roomId === roomId),
  }));
}

/**
 * La línea temporal del día: una fila por cada hora en la que abre el centro (y, si hay una clase
 * o un bloqueo fuera de ese horario, también su hora), con las clases de las salas que empiezan en
 * esa hora y los tramos en que una sala está bloqueada.
 */
export function buildRoomTimeline(agenda: RoomAgendaResponseDto): TimelineHour[] {
  const sessionEntries = listSessionEntries(agenda);
  const blockEntries = listBlockEntries(agenda);
  const hours = new Set([
    ...listOpenHours(agenda.openingRanges),
    ...sessionEntries.map(({ startHour }) => startHour),
    ...blockEntries.map(({ startHour }) => startHour),
  ]);

  return [...hours]
    .sort((first, second) => first - second)
    .map((hour) => ({
      label: formatHourLabel(hour),
      blocks: sessionEntries
        .filter(({ startHour }) => startHour === hour)
        .map(({ entry }) => entry)
        .sort((first, second) =>
          compareByStartAndRoom(
            { startsAt: first.session.startsAt, roomName: first.roomName },
            { startsAt: second.session.startsAt, roomName: second.roomName },
          ),
        ),
      roomBlocks: blockEntries
        .filter(({ startHour }) => startHour === hour)
        .map(({ entry }) => entry)
        .sort((first, second) =>
          compareByStartAndRoom(
            { startsAt: first.block.startsAt, roomName: first.roomName },
            { startsAt: second.block.startsAt, roomName: second.roomName },
          ),
        ),
    }));
}

/** Los servicios con clase ese día, sin repetir y por nombre (las fichas de filtro). */
export function listServicesOfTimeline(
  hours: readonly TimelineHour[],
): { id: string; name: string }[] {
  const namesById = new Map<string, string>();
  for (const hour of hours) {
    for (const block of hour.blocks) {
      namesById.set(block.session.service.id, block.session.service.name);
    }
  }
  return [...namesById]
    .map(([id, name]) => ({ id, name }))
    .sort((first, second) => first.name.localeCompare(second.name));
}

/** Solo las clases de un servicio; los bloqueos no tienen servicio, así que se ocultan. */
export function filterTimelineByService(
  hours: readonly TimelineHour[],
  serviceId: string | null,
): TimelineHour[] {
  if (serviceId === null) return [...hours];
  return hours.map((hour) => ({
    ...hour,
    blocks: hour.blocks.filter((block) => block.session.service.id === serviceId),
    roomBlocks: [],
  }));
}
