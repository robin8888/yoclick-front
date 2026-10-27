import { buildClassSessionRoute } from './session-route';

describe('buildClassSessionRoute', () => {
  it('opens the class inside the center routes when the center asks', () => {
    expect(
      buildClassSessionRoute({ bookingId: 'booking-1', date: '2026-10-27', isCenterWide: true }),
    ).toEqual({
      pathname: '/(admin)/sessions/[bookingId]',
      params: { bookingId: 'booking-1', date: '2026-10-27', isCenterWide: 'true' },
    });
  });

  it('opens the class inside the staff routes for a professional', () => {
    expect(
      buildClassSessionRoute({ bookingId: 'booking-1', date: '2026-10-27', isCenterWide: false }),
    ).toEqual({
      pathname: '/(staff)/sessions/[bookingId]',
      params: { bookingId: 'booking-1', date: '2026-10-27' },
    });
  });
});
