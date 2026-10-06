import type { AgendaResponseDto, AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { getZonedDateParts } from '@/shared/lib/format/zoned-date-parts';

const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 60_000;
const TWO_DIGITS = 2;
const TENTHS = 10;

type OpeningRange = AgendaResponseDto['openingRanges'][number];

/**
 * Qué hay en cada hora del día: una cita que empieza ahí, un hueco libre, la continuación de una
 * cita larga o una hora en la que el centro está cerrado.
 */
export type TimelineRowKind = 'booked' | 'free' | 'covered' | 'closed';

export interface TimelineRow {
  hour: number;
  /** «08:00». */
  label: string;
  kind: TimelineRowKind;
  entry: AgendaResponseDtoEntriesItem | null;
}

export interface DayTotals {
  appointmentCount: number;
  occupiedMinutes: number;
  freeSlotCount: number;
}

export interface DayTimeline {
  rows: TimelineRow[];
  totals: DayTotals;
}

interface TimelineRequest {
  openingRanges: readonly OpeningRange[];
  entries: readonly AgendaResponseDtoEntriesItem[];
  timeZone: string;
}

interface PlacedEntry {
  entry: AgendaResponseDtoEntriesItem;
  startHour: number;
  durationMinutes: number;
}

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(TWO_DIGITS, '0')}:00`;
}

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
}

function placeEntry(entry: AgendaResponseDtoEntriesItem, timeZone: string): PlacedEntry {
  const { startsAt, endsAt } = entry.booking;
  return {
    entry,
    startHour: getZonedDateParts(startsAt, timeZone).hour,
    durationMinutes: Math.round(
      (Date.parse(endsAt) - Date.parse(startsAt)) / MILLISECONDS_PER_MINUTE,
    ),
  };
}

/** Las horas enteras en las que el centro está abierto (una hora cuenta si abre al menos hasta su final). */
function listOpenHours(openingRanges: readonly OpeningRange[]): Set<number> {
  const openHours = new Set<number>();
  for (const range of openingRanges) {
    const closesAt = toMinutes(range.closesAt);
    for (let hour = Math.ceil(toMinutes(range.opensAt) / MINUTES_PER_HOUR); ; hour += 1) {
      if ((hour + 1) * MINUTES_PER_HOUR > closesAt) break;
      openHours.add(hour);
    }
  }
  return openHours;
}

function resolveHourSpan(openHours: ReadonlySet<number>, placed: readonly PlacedEntry[]): number[] {
  const hours = [...openHours, ...placed.map(({ startHour }) => startHour)];
  if (hours.length === 0) return [];
  const firstHour = Math.min(...hours);
  const lastHour = Math.max(...hours);
  return Array.from({ length: lastHour - firstHour + 1 }, (_unused, index) => firstHour + index);
}

interface HourFacts {
  placedByHour: ReadonlyMap<number, PlacedEntry>;
  coveredHours: ReadonlySet<number>;
  openHours: ReadonlySet<number>;
}

function describeHour(hour: number, facts: HourFacts): Pick<TimelineRow, 'kind' | 'entry'> {
  const placed = facts.placedByHour.get(hour);
  if (placed) return { kind: 'booked', entry: placed.entry };
  if (facts.coveredHours.has(hour)) return { kind: 'covered', entry: null };
  return { kind: facts.openHours.has(hour) ? 'free' : 'closed', entry: null };
}

/** La rejilla hora a hora de un día, con cuántas citas, cuánto tiempo ocupado y cuántos huecos hay. */
export function buildDayTimeline({
  openingRanges,
  entries,
  timeZone,
}: TimelineRequest): DayTimeline {
  const placed = entries
    .filter(({ booking }) => booking.status !== 'cancelled')
    .map((entry) => placeEntry(entry, timeZone));
  const openHours = listOpenHours(openingRanges);
  const placedByHour = new Map(placed.map((item) => [item.startHour, item]));
  const coveredHours = new Set(
    placed.flatMap(({ startHour, durationMinutes }) =>
      Array.from(
        { length: Math.max(Math.ceil(durationMinutes / MINUTES_PER_HOUR) - 1, 0) },
        (_unused, index) => startHour + index + 1,
      ),
    ),
  );
  const rows = resolveHourSpan(openHours, placed).map((hour) => ({
    hour,
    label: formatHourLabel(hour),
    ...describeHour(hour, { placedByHour, coveredHours, openHours }),
  }));

  return {
    rows,
    totals: {
      appointmentCount: placed.length,
      occupiedMinutes: placed.reduce((total, { durationMinutes }) => total + durationMinutes, 0),
      freeSlotCount: rows.filter(({ kind }) => kind === 'free').length,
    },
  };
}

/** «5,5 h» o «45 min»; las horas con coma decimal, como el resto de cifras de la app. */
export function formatOccupiedTime(occupiedMinutes: number): string {
  if (occupiedMinutes < MINUTES_PER_HOUR) return `${String(occupiedMinutes)} min`;
  const hours = Math.round((occupiedMinutes / MINUTES_PER_HOUR) * TENTHS) / TENTHS;
  return `${String(hours).replace('.', ',')} h`;
}

/** «08:00–20:00» (o «08:00–14:00 y 16:00–20:00»); `null` si ese día el centro no abre. */
export function describeOpeningRanges(openingRanges: readonly OpeningRange[]): string | null {
  if (openingRanges.length === 0) return null;
  return openingRanges.map(({ opensAt, closesAt }) => `${opensAt}–${closesAt}`).join(' y ');
}
