import { presentBookingStatus, resolveBookingDisplayStatus } from './booking-status';

describe('presentBookingStatus', () => {
  it.each([
    { status: 'confirmed', tone: 'success', canBeCancelled: true },
    { status: 'cancelled', tone: 'neutral', canBeCancelled: false },
    { status: 'attended', tone: 'info', canBeCancelled: false },
    { status: 'no_show', tone: 'warning', canBeCancelled: false },
  ] as const)('presents $status', ({ status, tone, canBeCancelled }) => {
    expect(presentBookingStatus(status)).toEqual({ tone, canBeCancelled });
  });
});

describe('resolveBookingDisplayStatus', () => {
  const NOW = new Date('2026-10-08T12:00:00.000Z');
  const UPCOMING_END = '2026-10-08T17:00:00.000Z';
  const PAST_END = '2026-10-08T09:00:00.000Z';

  it.each([
    {
      name: 'a normal upcoming booking',
      status: 'confirmed',
      endsAt: UPCOMING_END,
      needsNewPass: false,
      expected: 'confirmed',
    },
    {
      name: 'an upcoming booking whose pass was refunded',
      status: 'confirmed',
      endsAt: UPCOMING_END,
      needsNewPass: true,
      expected: 'needs_new_pass',
    },
    {
      name: 'a blocked booking whose time already passed',
      status: 'confirmed',
      endsAt: PAST_END,
      needsNewPass: true,
      expected: 'past',
    },
    {
      name: 'a cancelled booking even if flagged',
      status: 'cancelled',
      endsAt: UPCOMING_END,
      needsNewPass: true,
      expected: 'cancelled',
    },
  ] as const)('resolves $name', ({ expected, ...booking }) => {
    expect(resolveBookingDisplayStatus(booking, NOW)).toBe(expected);
  });

  it('presents a blocked booking as a warning that can still be cancelled', () => {
    expect(presentBookingStatus('needs_new_pass')).toEqual({
      tone: 'warning',
      canBeCancelled: true,
    });
  });
});
