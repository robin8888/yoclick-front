import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';

import {
  countBookableSessions,
  countRemainingSessions,
  getUsablePasses,
  pickHomePass,
} from './pass-summary';

function buildPass(
  overrides: Partial<PassListResponseDtoPassesItem>,
): PassListResponseDtoPassesItem {
  return {
    id: 'pass-1',
    name: 'Bono 10',
    status: 'active',
    totalSessions: 10,
    remainingSessions: 6,
    priceCents: 5000,
    services: [],
    isRequestedByClient: true,
    requestedAt: '2026-10-01T10:00:00.000Z',
    startsAt: '2026-10-02T10:00:00.000Z',
    expiresAt: '2026-11-01T10:00:00.000Z',
    client: { membershipId: 'membership-1', fullName: 'Ana Pérez' },
    ...overrides,
  };
}

describe('pass summary', () => {
  const soon = buildPass({
    id: 'soon',
    remainingSessions: 2,
    expiresAt: '2026-10-20T10:00:00.000Z',
  });
  const later = buildPass({ id: 'later', remainingSessions: 8 });
  const exhausted = buildPass({ id: 'exhausted', status: 'exhausted', remainingSessions: 0 });
  const pending = buildPass({ id: 'pending', status: 'pending', expiresAt: null });

  it('keeps only the usable ones, the one that expires first at the front', () => {
    expect(getUsablePasses([later, exhausted, pending, soon]).map(({ id }) => id)).toEqual([
      'soon',
      'later',
    ]);
  });

  it('adds up what is left across the usable passes', () => {
    expect(countRemainingSessions([later, soon, exhausted, pending])).toBe(10);
  });

  it('picks the pass that will be used first, or none', () => {
    expect(pickHomePass([later, soon])?.id).toBe('soon');
    expect(pickHomePass([exhausted, pending])).toBeNull();
  });
});

describe('countBookableSessions', () => {
  it('takes the booked classes off what is left, so a pass of 10 with 5 booked offers 5', () => {
    const pass = buildPass({ remainingSessions: 10 });
    const upcoming = Array.from({ length: 5 }, () => ({
      status: 'confirmed',
      source: 'single',
      service: { id: 'service-1' },
    }));

    expect(countBookableSessions([pass], upcoming)).toBe(5);
  });

  it('ignores cancelled and enrolment bookings and never goes below zero', () => {
    const pass = buildPass({ remainingSessions: 1 });

    expect(
      countBookableSessions(
        [pass],
        [
          { status: 'cancelled', source: 'single', service: { id: 'service-1' } },
          { status: 'confirmed', source: 'enrollment', service: { id: 'service-1' } },
        ],
      ),
    ).toBe(1);
    expect(
      countBookableSessions(
        [pass],
        [
          { status: 'confirmed', source: 'single', service: { id: 'service-1' } },
          { status: 'confirmed', source: 'single', service: { id: 'service-1' } },
        ],
      ),
    ).toBe(0);
  });
});
