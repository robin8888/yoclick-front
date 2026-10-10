import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { formatTime24h } from '@/shared/lib/format/format-time';

import type { RoomSession } from './room-agenda';

/** Una clase en la línea temporal: la sala, el servicio, el profesor y cuántas personas faltan. */
export interface TimelineBlock {
  roomId: string;
  roomName: string;
  session: RoomSession;
  /** Personas que faltan para completar el aforo; 0 si está completa o es una cita privada. */
  missingCount: number;
}

export interface TimelineHour {
  /** «17:00». */
  label: string;
  blocks: TimelineBlock[];
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
  if (session.mode === 'private') return 0;
  return Math.max(session.capacity - session.bookedCount, 0);
}

/**
 * La línea temporal del día: una fila por cada hora en la que abre el centro (y, si hay una clase
 * fuera de ese horario, también su hora), con las clases de las salas que empiezan en esa hora.
 */
export function buildRoomTimeline(agenda: RoomAgendaResponseDto): TimelineHour[] {
  const entries = agenda.rooms.flatMap((room) =>
    room.sessions.map((session) => ({
      startHour: Number(
        formatTime24h(session.startsAt, agenda.timezone).slice(0, HOUR_DIGITS_LENGTH),
      ),
      block: {
        roomId: room.id,
        roomName: room.name,
        session,
        missingCount: countMissing(session),
      },
    })),
  );
  const hours = new Set([
    ...listOpenHours(agenda.openingRanges),
    ...entries.map((entry) => entry.startHour),
  ]);

  return [...hours]
    .sort((first, second) => first - second)
    .map((hour) => ({
      label: formatHourLabel(hour),
      blocks: entries
        .filter((entry) => entry.startHour === hour)
        .map((entry) => entry.block)
        .sort(
          (first, second) =>
            first.session.startsAt.localeCompare(second.session.startsAt) ||
            first.roomName.localeCompare(second.roomName),
        ),
    }));
}
