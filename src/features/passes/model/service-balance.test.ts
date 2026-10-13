import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';

import { getServicePassBalance } from './service-balance';

const KARATE = { id: 'service-karate', name: 'Karate' };
const YOGA = { id: 'service-yoga', name: 'Yoga' };

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

describe('getServicePassBalance', () => {
  it('adds up the classes of the usable passes that are valid for the service', () => {
    const balance = getServicePassBalance(
      [
        buildPass({ id: 'all', remainingSessions: 4 }),
        buildPass({ id: 'karate', services: [KARATE], remainingSessions: 3 }),
        buildPass({ id: 'yoga', services: [YOGA], remainingSessions: 9 }),
        buildPass({ id: 'exhausted', status: 'exhausted', remainingSessions: 0 }),
      ],
      KARATE.id,
    );

    expect(balance?.remainingSessions).toBe(7);
  });

  it('names the pass that expires first', () => {
    const balance = getServicePassBalance(
      [
        buildPass({ id: 'later', name: 'Largo' }),
        buildPass({ id: 'sooner', name: 'Corto', expiresAt: '2026-10-20T10:00:00.000Z' }),
      ],
      KARATE.id,
    );

    expect(balance).toMatchObject({ passId: 'sooner', passName: 'Corto' });
  });

  it('offers what is left minus the classes already booked and not yet used', () => {
    const balance = getServicePassBalance([buildPass({ remainingSessions: 10 })], KARATE.id, [
      { status: 'confirmed', source: 'single', service: { id: KARATE.id } },
      { status: 'confirmed', source: 'single', service: { id: YOGA.id } },
      { status: 'cancelled', source: 'single', service: { id: KARATE.id } },
      { status: 'confirmed', source: 'enrollment', service: { id: KARATE.id } },
    ]);

    expect(balance).toMatchObject({
      remainingSessions: 10,
      reservedSessions: 2,
      bookableSessions: 8,
    });
  });

  it('only counts the booked classes of the services the pass covers', () => {
    const balance = getServicePassBalance(
      [buildPass({ services: [KARATE], remainingSessions: 4 })],
      KARATE.id,
      [
        { status: 'confirmed', source: 'single', service: { id: KARATE.id } },
        { status: 'confirmed', source: 'single', service: { id: YOGA.id } },
      ],
    );

    expect(balance?.reservedSessions).toBe(1);
  });

  it('never offers a negative number', () => {
    const balance = getServicePassBalance([buildPass({ remainingSessions: 1 })], KARATE.id, [
      { status: 'confirmed', source: 'single', service: { id: KARATE.id } },
      { status: 'confirmed', source: 'single', service: { id: KARATE.id } },
    ]);

    expect(balance?.bookableSessions).toBe(0);
  });

  it('is null when no pass can be used for that service', () => {
    expect(getServicePassBalance([buildPass({ services: [YOGA] })], KARATE.id)).toBeNull();
    expect(getServicePassBalance([], KARATE.id)).toBeNull();
  });
});
