import { calculateCheckInQrAvailability } from './check-in-qr-availability';

const STARTS_AT_ISO = '2026-10-07T16:00:00.000Z';
const ENDS_AT_ISO = '2026-10-07T17:00:00.000Z';
const OPENS_AT_ISO = '2026-10-07T15:45:00.000Z';

describe('calculateCheckInQrAvailability', () => {
  it.each([
    { caseName: '1 hour before', nowIso: '2026-10-07T15:00:00.000Z', isAvailable: false },
    { caseName: '1 ms before opening', nowIso: '2026-10-07T15:44:59.999Z', isAvailable: false },
    { caseName: 'exactly at opening', nowIso: OPENS_AT_ISO, isAvailable: true },
    { caseName: 'when the appointment starts', nowIso: STARTS_AT_ISO, isAvailable: true },
    { caseName: 'exactly at the end', nowIso: ENDS_AT_ISO, isAvailable: true },
    { caseName: 'after the end', nowIso: '2026-10-07T17:00:00.001Z', isAvailable: false },
  ])('is $isAvailable $caseName', ({ nowIso, isAvailable }) => {
    const availability = calculateCheckInQrAvailability({
      startsAtIso: STARTS_AT_ISO,
      endsAtIso: ENDS_AT_ISO,
      nowMs: Date.parse(nowIso),
    });

    expect(availability.isAvailable).toBe(isAvailable);
  });

  it('tells when it opens: 15 minutes before the appointment', () => {
    const availability = calculateCheckInQrAvailability({
      startsAtIso: STARTS_AT_ISO,
      endsAtIso: ENDS_AT_ISO,
      nowMs: Date.parse('2026-10-07T10:00:00.000Z'),
    });

    expect(availability).toEqual({ isAvailable: false, opensAtIso: OPENS_AT_ISO });
  });
});
