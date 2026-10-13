import type {
  AgendaResponseDtoEmptySessionsItem,
  AgendaResponseDtoEntriesItem,
  AgendaResponseDtoOpeningRangesItem,
} from '@/shared/api/generated/model';
import { formatTime24h } from '@/shared/lib/format/format-time';

const MINUTES_PER_HOUR = 60;
const DEFAULT_FIRST_HOUR = 8;
const DEFAULT_LAST_HOUR = 20;
const MILLISECONDS_PER_MINUTE = 60_000;
/** «17:30»: cinco caracteres. */
const CLOCK_TEXT_LENGTH = 5;
/** Una clase muy corta se dibuja al menos así de alta para que se pueda leer y tocar. */
const MIN_EVENT_MINUTES = 30;

/** Una clase del profesional en el día: un bloque, aunque tenga varias personas apuntadas. */
export interface DayEvent {
  /** Id de la clase (sesión): agrupa a las personas de un grupo. */
  sessionId: string;
  /** La reserva que se abre al tocar el bloque; `null` si aún no hay nadie apuntado. */
  bookingId: string | null;
  serviceName: string;
  roomName: string | null;
  /** Cuántas personas hay apuntadas: la agenda no enseña quiénes, eso es del detalle. */
  personCount: number;
  /** Minutos desde las 00:00 en la zona del centro. */
  startMinutes: number;
  endMinutes: number;
  /** Columna dentro de su grupo de clases que se solapan, y cuántas columnas tiene el grupo. */
  column: number;
  columnCount: number;
}

export interface IosDayLayout {
  /** Primera y última hora en punto que se dibujan (la última es el cierre). */
  firstHour: number;
  lastHour: number;
  events: DayEvent[];
}

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
}

function readLocalMinutes(instant: string, timeZone: string): number {
  return toMinutes(formatTime24h(instant, timeZone).slice(0, CLOCK_TEXT_LENGTH));
}

function readDurationMinutes(startsAt: string, endsAt: string): number {
  return Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / MILLISECONDS_PER_MINUTE);
}

/** Agrupa las reservas de una misma clase en un solo bloque, en orden de comienzo. */
function groupBySession(
  entries: readonly AgendaResponseDtoEntriesItem[],
  timeZone: string,
): Omit<DayEvent, 'column' | 'columnCount'>[] {
  const bySession = new Map<string, Omit<DayEvent, 'column' | 'columnCount'>>();
  for (const { booking } of entries) {
    if (booking.status === 'cancelled') continue;
    const existing = bySession.get(booking.session.id);
    if (existing !== undefined) {
      existing.personCount += 1;
      continue;
    }
    const startMinutes = readLocalMinutes(booking.startsAt, timeZone);
    const durationMinutes = Math.max(
      readDurationMinutes(booking.startsAt, booking.endsAt),
      MIN_EVENT_MINUTES,
    );
    bySession.set(booking.session.id, {
      sessionId: booking.session.id,
      bookingId: booking.id,
      serviceName: booking.service.name,
      roomName: booking.room?.name ?? null,
      personCount: 1,
      startMinutes,
      endMinutes: startMinutes + durationMinutes,
    });
  }
  return [...bySession.values()].sort(
    (left, right) => left.startMinutes - right.startMinutes || left.endMinutes - right.endMinutes,
  );
}

/** Una clase del horario sin nadie apuntado: ocupa su hueco pero no se puede abrir. */
function toEmptyEvent(
  session: AgendaResponseDtoEmptySessionsItem,
  timeZone: string,
): Omit<DayEvent, 'column' | 'columnCount'> {
  const startMinutes = readLocalMinutes(session.startsAt, timeZone);
  const durationMinutes = Math.max(
    readDurationMinutes(session.startsAt, session.endsAt),
    MIN_EVENT_MINUTES,
  );
  return {
    sessionId: session.id,
    bookingId: null,
    serviceName: session.service.name,
    roomName: session.room?.name ?? null,
    personCount: 0,
    startMinutes,
    endMinutes: startMinutes + durationMinutes,
  };
}

/**
 * Reparte las clases que se solapan en columnas, como el calendario de iOS: cada clase ocupa la
 * primera columna libre y todas las de un mismo grupo solapado comparten el ancho a partes iguales.
 */
function assignColumns(events: readonly Omit<DayEvent, 'column' | 'columnCount'>[]): DayEvent[] {
  const placed: DayEvent[] = [];
  let cluster: DayEvent[] = [];
  let clusterEnd = -1;
  const closeCluster = (): void => {
    const columnCount = Math.max(...cluster.map(({ column }) => column + 1), 1);
    for (const event of cluster) event.columnCount = columnCount;
    placed.push(...cluster);
    cluster = [];
  };
  for (const event of events) {
    if (cluster.length > 0 && event.startMinutes >= clusterEnd) closeCluster();
    const taken = new Set(
      cluster
        .filter(({ endMinutes }) => endMinutes > event.startMinutes)
        .map(({ column }) => column),
    );
    let column = 0;
    while (taken.has(column)) column += 1;
    cluster.push({ ...event, column, columnCount: 1 });
    clusterEnd = Math.max(clusterEnd, event.endMinutes);
  }
  if (cluster.length > 0) closeCluster();
  return placed;
}

/** El rango de horas a dibujar: el horario de apertura, ampliado si alguna clase se sale. */
function resolveHourRange(
  openingRanges: readonly AgendaResponseDtoOpeningRangesItem[],
  events: readonly DayEvent[],
): { firstHour: number; lastHour: number } {
  const starts = [
    ...openingRanges.map(({ opensAt }) => toMinutes(opensAt)),
    ...events.map(({ startMinutes }) => startMinutes),
  ];
  const ends = [
    ...openingRanges.map(({ closesAt }) => toMinutes(closesAt)),
    ...events.map(({ endMinutes }) => endMinutes),
  ];
  if (starts.length === 0) return { firstHour: DEFAULT_FIRST_HOUR, lastHour: DEFAULT_LAST_HOUR };
  return {
    firstHour: Math.floor(Math.min(...starts) / MINUTES_PER_HOUR),
    lastHour: Math.ceil(Math.max(...ends) / MINUTES_PER_HOUR),
  };
}

/** La agenda de un día como el calendario de iOS: horas a lo largo y cada clase un bloque. */
export function buildIosDayLayout(input: {
  entries: readonly AgendaResponseDtoEntriesItem[];
  emptySessions: readonly AgendaResponseDtoEmptySessionsItem[];
  openingRanges: readonly AgendaResponseDtoOpeningRangesItem[];
  timeZone: string;
}): IosDayLayout {
  const booked = groupBySession(input.entries, input.timeZone);
  const empty = input.emptySessions.map((session) => toEmptyEvent(session, input.timeZone));
  const sorted = [...booked, ...empty].sort(
    (left, right) => left.startMinutes - right.startMinutes || left.endMinutes - right.endMinutes,
  );
  const events = assignColumns(sorted);
  return { ...resolveHourRange(input.openingRanges, events), events };
}

/** Minutos desde las 00:00 de «ahora» en la zona del centro. */
export function readNowMinutes(now: Date, timeZone: string): number {
  return readLocalMinutes(now.toISOString(), timeZone);
}
