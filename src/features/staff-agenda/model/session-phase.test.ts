import { isWithinStartWindow, resolveAgendaPhase, resolveSessionPhase } from './session-phase';

describe('resolveSessionPhase', () => {
  it.each([
    {
      caseName: 'cancelled',
      status: 'cancelled',
      startedAt: null,
      endedAt: null,
      expectedPhase: 'cancelled',
    },
    {
      caseName: 'confirmed and not opened',
      status: 'confirmed',
      startedAt: null,
      endedAt: null,
      expectedPhase: 'not-started',
    },
    {
      caseName: 'opened and not closed',
      status: 'confirmed',
      startedAt: '2026-10-08T16:01:00.000Z',
      endedAt: null,
      expectedPhase: 'in-progress',
    },
    {
      caseName: 'closed (the API marks it attended)',
      status: 'attended',
      startedAt: '2026-10-08T16:01:00.000Z',
      endedAt: '2026-10-08T16:58:00.000Z',
      expectedPhase: 'finished',
    },
  ])('is $expected when $caseName', ({ status, startedAt, endedAt, expectedPhase }) => {
    expect(resolveSessionPhase({ status, startedAt, endedAt })).toBe(expectedPhase);
  });
});

describe('isWithinStartWindow', () => {
  const STARTS_AT = '2026-10-08T16:00:00.000Z';
  const ENDS_AT = '2026-10-08T17:00:00.000Z';

  it.each([
    ['20 minutes before', '2026-10-08T15:40:00.000Z', false],
    ['exactly 15 minutes before', '2026-10-08T15:45:00.000Z', true],
    ['at the start time', '2026-10-08T16:00:00.000Z', true],
    ['in the middle', '2026-10-08T16:30:00.000Z', true],
    ['exactly at the end', '2026-10-08T17:00:00.000Z', true],
    ['one minute after the end', '2026-10-08T17:01:00.000Z', false],
  ])('is %s → %s', (_caseName, nowIso, isExpected) => {
    expect(
      isWithinStartWindow({ startsAt: STARTS_AT, endsAt: ENDS_AT, now: new Date(nowIso) }),
    ).toBe(isExpected);
  });
});

describe('resolveAgendaPhase', () => {
  const NOW = new Date('2026-10-13T10:00:00.000Z');
  const PAST_END = '2026-10-13T09:00:00.000Z';
  const FUTURE_END = '2026-10-13T11:00:00.000Z';

  it.each([
    {
      caseName: 'never opened and already over',
      booking: { status: 'confirmed', startedAt: null, endedAt: null, endsAt: PAST_END },
      expectedPhase: 'past',
    },
    {
      caseName: 'never opened and still to come',
      booking: { status: 'confirmed', startedAt: null, endedAt: null, endsAt: FUTURE_END },
      expectedPhase: 'not-started',
    },
    {
      caseName: 'registered and over',
      booking: {
        status: 'attended',
        startedAt: '2026-10-13T08:01:00.000Z',
        endedAt: '2026-10-13T08:58:00.000Z',
        endsAt: PAST_END,
      },
      expectedPhase: 'finished',
    },
    {
      caseName: 'cancelled and over',
      booking: { status: 'cancelled', startedAt: null, endedAt: null, endsAt: PAST_END },
      expectedPhase: 'cancelled',
    },
  ])('says $expectedPhase for $caseName', ({ booking, expectedPhase }) => {
    expect(resolveAgendaPhase(booking, NOW)).toBe(expectedPhase);
  });
});
