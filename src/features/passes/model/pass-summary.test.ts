import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';

import { countRemainingSessions, getUsablePasses, pickHomePass } from './pass-summary';

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
