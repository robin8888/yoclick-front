import { presentBookingStatus } from './booking-status';

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
