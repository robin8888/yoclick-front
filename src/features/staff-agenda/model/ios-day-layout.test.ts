import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';

import { buildIosDayLayout } from './ios-day-layout';

const TIME_ZONE = 'Europe/Madrid';
const OPENING = [{ opensAt: '09:00', closesAt: '14:00' }];

interface EntryOptions {
  bookingId: string;
  sessionId: string;
  startsAt: string;
  endsAt: string;
  clientName?: string;
  status?: string;
}

function buildEntry(options: EntryOptions): AgendaResponseDtoEntriesItem {
  return {
    booking: {
      id: options.bookingId,
      status: options.status ?? 'confirmed',
      startsAt: options.startsAt,
      endsAt: options.endsAt,
      service: { id: 'service-1', name: 'Karate infantil' },
      room: { id: 'room-1', name: 'Sala A' },
      session: { id: options.sessionId, mode: 'group', capacity: 10, bookedCount: 1 },
    },
    client: { membershipId: `client-${options.bookingId}`, fullName: options.clientName ?? 'Ana' },
  } as unknown as AgendaResponseDtoEntriesItem;
}

describe('buildIosDayLayout', () => {
  it('places a class by its local start and end minutes', () => {
    const layout = buildIosDayLayout({
      entries: [
        buildEntry({
          bookingId: 'b1',
          sessionId: 's1',
          startsAt: '2026-10-14T08:30:00.000Z',
          endsAt: '2026-10-14T10:30:00.000Z',
        }),
      ],
      openingRanges: OPENING,
      timeZone: TIME_ZONE,
    });

    expect(layout.events).toHaveLength(1);
    expect(layout.events[0]).toMatchObject({
      startMinutes: 630,
      endMinutes: 750,
      column: 0,
      columnCount: 1,
    });
  });

  it('shows one block for a group class with everyone who is in it', () => {
    const layout = buildIosDayLayout({
      entries: [
        buildEntry({
          bookingId: 'b1',
          sessionId: 's1',
          startsAt: '2026-10-14T12:00:00.000Z',
          endsAt: '2026-10-14T14:00:00.000Z',
          clientName: 'Ana',
        }),
        buildEntry({
          bookingId: 'b2',
          sessionId: 's1',
          startsAt: '2026-10-14T12:00:00.000Z',
          endsAt: '2026-10-14T14:00:00.000Z',
          clientName: 'Luis',
        }),
      ],
      openingRanges: OPENING,
      timeZone: TIME_ZONE,
    });

    expect(layout.events).toHaveLength(1);
    expect(layout.events[0]?.clientNames).toEqual(['Ana', 'Luis']);
  });

  it('puts classes that overlap side by side and leaves the rest full width', () => {
    const layout = buildIosDayLayout({
      entries: [
        buildEntry({
          bookingId: 'b1',
          sessionId: 's1',
          startsAt: '2026-10-14T08:00:00.000Z',
          endsAt: '2026-10-14T09:00:00.000Z',
        }),
        buildEntry({
          bookingId: 'b2',
          sessionId: 's2',
          startsAt: '2026-10-14T08:30:00.000Z',
          endsAt: '2026-10-14T09:30:00.000Z',
        }),
        buildEntry({
          bookingId: 'b3',
          sessionId: 's3',
          startsAt: '2026-10-14T10:00:00.000Z',
          endsAt: '2026-10-14T11:00:00.000Z',
        }),
      ],
      openingRanges: OPENING,
      timeZone: TIME_ZONE,
    });

    const byBooking = Object.fromEntries(layout.events.map((event) => [event.bookingId, event]));
    expect(byBooking.b1).toMatchObject({ column: 0, columnCount: 2 });
    expect(byBooking.b2).toMatchObject({ column: 1, columnCount: 2 });
    expect(byBooking.b3).toMatchObject({ column: 0, columnCount: 1 });
  });

  it('ignores cancelled bookings', () => {
    const layout = buildIosDayLayout({
      entries: [
        buildEntry({
          bookingId: 'b1',
          sessionId: 's1',
          startsAt: '2026-10-14T08:00:00.000Z',
          endsAt: '2026-10-14T09:00:00.000Z',
          status: 'cancelled',
        }),
      ],
      openingRanges: OPENING,
      timeZone: TIME_ZONE,
    });

    expect(layout.events).toHaveLength(0);
  });

  it('draws the opening hours, widened when a class falls outside them', () => {
    const empty = buildIosDayLayout({ entries: [], openingRanges: OPENING, timeZone: TIME_ZONE });
    expect(empty).toMatchObject({ firstHour: 9, lastHour: 14 });

    const wide = buildIosDayLayout({
      entries: [
        buildEntry({
          bookingId: 'b1',
          sessionId: 's1',
          startsAt: '2026-10-14T15:00:00.000Z',
          endsAt: '2026-10-14T17:00:00.000Z',
        }),
      ],
      openingRanges: OPENING,
      timeZone: TIME_ZONE,
    });
    expect(wide).toMatchObject({ firstHour: 9, lastHour: 19 });
  });
});
