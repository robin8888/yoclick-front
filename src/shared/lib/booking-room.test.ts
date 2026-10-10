import { describeBookingRoom } from './booking-room';

const GROUP = { mode: 'group' as const, capacity: 10, bookedCount: 3 };
const PRIVATE = { mode: 'private' as const, capacity: 1, bookedCount: 1 };

describe('describeBookingRoom', () => {
  it.each([
    ['a booking without a room', { room: null, session: PRIVATE }, null],
    ['a private booking in a room', { room: { name: 'Ana' }, session: PRIVATE }, 'Sala Ana'],
    [
      'a group booking seen by the team',
      { room: { name: 'Tatami' }, session: GROUP },
      'Sala Tatami · 3 de 10 plazas',
    ],
  ])('%s', (_caseName, booking, expectedLabel) => {
    expect(describeBookingRoom(booking, { shouldShowSeats: true })).toBe(expectedLabel);
  });

  it('does not show the seats to the client', () => {
    expect(
      describeBookingRoom({ room: { name: 'Tatami' }, session: GROUP }, { shouldShowSeats: false }),
    ).toBe('Sala Tatami');
  });
});
